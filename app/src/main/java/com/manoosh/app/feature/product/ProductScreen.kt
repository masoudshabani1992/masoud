package com.manoosh.app.feature.product

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Config
import com.manoosh.app.core.common.JalaliDate
import com.manoosh.app.core.common.fa
import com.manoosh.app.core.common.formatMoney
import com.manoosh.app.core.ui.components.DiscountBadge
import com.manoosh.app.core.ui.components.ErrorState
import com.manoosh.app.core.ui.components.HtmlText
import com.manoosh.app.core.ui.components.LoadingBox
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.core.ui.components.PriceText
import com.manoosh.app.core.ui.components.ProductRail
import com.manoosh.app.core.ui.components.QuantityStepper
import com.manoosh.app.core.ui.components.RatingRow
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.data.repository.FavoritesRepository
import com.manoosh.app.data.repository.ProductRepository
import com.manoosh.app.domain.Product
import com.manoosh.app.domain.Review
import com.manoosh.app.domain.VariationUi
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ProductUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val isNetworkError: Boolean = false,
    val product: Product? = null,
    val variations: List<VariationUi> = emptyList(),
    val selectedOptions: Map<String, String> = emptyMap(),
    val quantity: Int = 1,
    val reviews: List<Review> = emptyList(),
    val related: List<Product> = emptyList(),
    val isFavorite: Boolean = false,
    val adding: Boolean = false,
    val tab: Int = 0
) {
    val selectedVariation: VariationUi?
        get() {
            if (variations.isEmpty() || selectedOptions.isEmpty()) return null
            return variations.firstOrNull { v ->
                v.options.all { (k, o) -> selectedOptions[k] == o } &&
                    selectedOptions.all { (k, o) -> v.options[k] == o }
            }
        }

    val effectivePriceMinor: Long? get() = selectedVariation?.priceMinor ?: product?.priceMinor
    val effectiveRegularMinor: Long? get() = selectedVariation?.regularMinor ?: product?.regularMinor
    val effectiveInStock: Boolean get() = selectedVariation?.inStock ?: product?.inStock ?: false
}

@HiltViewModel
class ProductViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val products: ProductRepository,
    private val cart: CartRepository,
    private val favorites: FavoritesRepository
) : ViewModel() {

    private val argId: Long = savedStateHandle.get<Long>("id") ?: 0L
    private val argSlug: String? = savedStateHandle.get<String>("slug")

    private val _state = MutableStateFlow(ProductUiState())
    val state: StateFlow<ProductUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val res = if (argId > 0) products.product(argId)
            else {
                val slug = argSlug
                if (slug.isNullOrBlank()) ApiResult.Error("product_not_found")
                else products.productBySlug(slug).map { it }
                    .let { r ->
                        when (r) {
                            is ApiResult.Success -> if (r.data == null) ApiResult.Error("product_not_found") else ApiResult.Success(r.data)
                            is ApiResult.Error -> r
                        }
                    }
            }
            when (res) {
                is ApiResult.Success -> {
                    val p = res.data
                    _state.update { it.copy(isLoading = false, product = p) }
                    launch { loadExtras(p) }
                    launch {
                        favorites.isFavorite(p.id).collect { fav ->
                            _state.update { it.copy(isFavorite = fav) }
                        }
                    }
                }
                is ApiResult.Error -> _state.update {
                    it.copy(isLoading = false, error = res.message, isNetworkError = res.isNetwork)
                }
            }
        }
    }

    private suspend fun loadExtras(p: Product) {
        if (p.hasVariations) {
            val v = products.variations(p.id)
            if (v is ApiResult.Success) {
                _state.update { it.copy(variations = v.data) }
                // Preselect when there's only one possible option per attribute.
                if (v.data.size == 1) {
                    _state.update { it.copy(selectedOptions = v.data.first().options) }
                }
            }
        }
        val rev = products.reviews(p.id)
        if (rev is ApiResult.Success) _state.update { it.copy(reviews = rev.data) }
        val catId = p.categories.firstOrNull()?.id ?: 0L
        if (catId > 0) {
            val rel = products.related(catId, p.id)
            if (rel is ApiResult.Success) _state.update { it.copy(related = rel.data) }
        }
    }

    fun selectOption(attr: String, option: String) {
        _state.update {
            val map = it.selectedOptions.toMutableMap()
            if (map[attr] == option) map.remove(attr) else map[attr] = option
            it.copy(selectedOptions = map)
        }
    }

    fun setQuantity(q: Int) {
        val max = _state.value.product?.maxQty ?: 99
        _state.update { it.copy(quantity = q.coerceIn(1, max.coerceAtLeast(1))) }
    }

    fun setTab(tab: Int) {
        _state.update { it.copy(tab = tab) }
    }

    fun toggleFavorite() {
        val p = _state.value.product ?: return
        viewModelScope.launch {
            val nowFav = favorites.toggle(p)
            _messages.tryEmit(if (nowFav) "به علاقه‌مندی‌ها اضافه شد" else "از علاقه‌مندی‌ها حذف شد")
        }
    }

    fun addToCart() {
        val s = _state.value
        val p = s.product ?: return
        if (!s.effectiveInStock) {
            _messages.tryEmit("این کالا ناموجود است")
            return
        }
        if (s.variations.isNotEmpty() && s.selectedVariation == null) {
            _messages.tryEmit("لطفاً همه گزینه‌ها را انتخاب کنید")
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(adding = true) }
            val res = if (s.selectedVariation != null) {
                cart.addVariation(s.selectedVariation.id, s.quantity)
            } else {
                cart.add(p.id, s.quantity)
            }
            _state.update { it.copy(adding = false) }
            if (res is ApiResult.Success) _messages.tryEmit("به سبد خرید اضافه شد")
            else _messages.tryEmit((res as ApiResult.Error).message)
        }
    }

    fun quickAdd(product: Product) {
        viewModelScope.launch {
            val res = cart.add(product.id, 1)
            if (res is ApiResult.Success) _messages.tryEmit("به سبد خرید اضافه شد")
            else _messages.tryEmit((res as ApiResult.Error).message)
        }
    }
}

@Composable
fun ProductScreen(
    productId: Long,
    slug: String?,
    onBack: () -> Unit,
    onProductClick: (Long) -> Unit,
    onCartClick: () -> Unit,
    onLoginClick: () -> Unit,
    viewModel: ProductViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = {
            ManooshTopBar(
                title = state.product?.name ?: "",
                onBack = onBack,
                actions = {
                    val p = state.product
                    if (p != null) {
                        IconButton(onClick = {
                            val intent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, Config.productShareText(p.name, p.permalink.ifBlank { Config.baseUrl }))
                            }
                            context.startActivity(Intent.createChooser(intent, null))
                        }) {
                            Icon(Icons.Filled.Share, contentDescription = stringResource(R.string.share))
                        }
                        IconButton(onClick = viewModel::toggleFavorite) {
                            Icon(
                                if (state.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                                contentDescription = stringResource(R.string.favorites),
                                tint = if (state.isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                    IconButton(onClick = onCartClick) {
                        Icon(Icons.Filled.ShoppingCart, contentDescription = stringResource(R.string.cart_title))
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            val p = state.product
            if (p != null && !state.isLoading) {
                Surface(shadowElevation = 8.dp) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        PriceText(
                            minor = state.effectivePriceMinor,
                            regularMinor = state.effectiveRegularMinor,
                            minorUnit = p.minorUnit,
                            suffix = p.currencySuffix,
                            large = true,
                            modifier = Modifier.weight(1f)
                        )
                        Button(
                            onClick = viewModel::addToCart,
                            enabled = !state.adding && state.effectiveInStock,
                            modifier = Modifier.height(48.dp)
                        ) {
                            Text(
                                if (state.effectiveInStock) stringResource(R.string.add_to_cart)
                                else stringResource(R.string.out_of_stock)
                            )
                        }
                    }
                }
            }
        }
    ) { padding ->
        when {
            state.isLoading -> LoadingBox(Modifier.padding(padding))
            state.error != null -> ErrorState(
                message = if (state.error == "product_not_found") "کالا پیدا نشد" else state.error.orEmpty(),
                isNetwork = state.isNetworkError,
                onRetry = viewModel::load,
                modifier = Modifier.padding(padding)
            )
            state.product != null -> {
                val p = state.product!!
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(bottom = 16.dp)
                ) {
                    item { Gallery(images = p.images.map { it.src }, discount = p.discountPercent, lowStock = p.lowStockRemaining) }
                    item {
                        Column(Modifier.padding(16.dp)) {
                            Text(p.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(6.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                RatingRow(p.rating, p.reviewCount)
                                if (p.sku.isNotBlank()) {
                                    Spacer(Modifier.width(12.dp))
                                    Text(
                                        "کد: ${p.sku}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            if (p.shortDescription.isNotBlank()) {
                                Spacer(Modifier.height(8.dp))
                                Text(p.shortDescription, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                    // Variation selectors.
                    if (state.variations.isNotEmpty()) {
                        item {
                            VariationSelectors(
                                attributes = p.attributes,
                                selected = state.selectedOptions,
                                onSelect = viewModel::selectOption
                            )
                        }
                    }
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("تعداد", style = MaterialTheme.typography.titleSmall)
                            QuantityStepper(
                                quantity = state.quantity,
                                maxQty = p.maxQty,
                                onChange = viewModel::setQuantity
                            )
                        }
                    }
                    item {
                        val tabs = listOf(
                            stringResource(R.string.description),
                            stringResource(R.string.specs),
                            "${stringResource(R.string.reviews)} (${p.reviewCount.fa()})"
                        )
                        TabRow(selectedTabIndex = state.tab) {
                            tabs.forEachIndexed { i, title ->
                                Tab(selected = state.tab == i, onClick = { viewModel.setTab(i) }, text = { Text(title) })
                            }
                        }
                        when (state.tab) {
                            0 -> DescriptionTab(p.description.ifBlank { p.shortDescription })
                            1 -> SpecsTab(product = p)
                            2 -> ReviewsTab(reviews = state.reviews)
                        }
                    }
                    if (state.related.isNotEmpty()) {
                        item {
                            Spacer(Modifier.height(8.dp))
                            ProductRail(
                                title = stringResource(R.string.related_products),
                                products = state.related,
                                onProductClick = { onProductClick(it.id) },
                                onAdd = viewModel::quickAdd
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun Gallery(images: List<String>, discount: Int, lowStock: Int?) {
    val imgs = images.ifEmpty { listOf("") }
    val pagerState = rememberPagerState(pageCount = { imgs.size })
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .background(MaterialTheme.colorScheme.surfaceVariant)
    ) {
        HorizontalPager(state = pagerState, modifier = Modifier.matchParentSize()) { page ->
            AsyncImage(
                model = imgs[page],
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.matchParentSize()
            )
        }
        if (discount > 0) {
            DiscountBadge(discount, modifier = Modifier.align(Alignment.TopStart).padding(16.dp))
        }
        if (lowStock != null) {
            Surface(
                color = MaterialTheme.colorScheme.errorContainer,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.align(Alignment.BottomStart).padding(16.dp)
            ) {
                Text(
                    stringResource(R.string.low_stock, lowStock.fa()),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }
        if (imgs.size > 1) {
            Row(
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                repeat(imgs.size) { i ->
                    Box(
                        Modifier
                            .size(if (pagerState.currentPage == i) 10.dp else 8.dp)
                            .clip(CircleShape)
                            .background(
                                if (pagerState.currentPage == i) MaterialTheme.colorScheme.primary
                                else Color.White.copy(alpha = 0.7f)
                            )
                    )
                }
            }
        }
    }
}

@Composable
private fun VariationSelectors(
    attributes: List<com.manoosh.app.domain.ProductAttribute>,
    selected: Map<String, String>,
    onSelect: (String, String) -> Unit
) {
    Column(Modifier.padding(horizontal = 16.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        attributes.forEach { attr ->
            if (attr.options.isNotEmpty()) {
                Text(stringResource(R.string.select_option, attr.name), style = MaterialTheme.typography.titleSmall)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(attr.options) { option ->
                        val isSelected = selected[attr.name] == option
                        AssistChip(
                            onClick = { onSelect(attr.name, option) },
                            label = { Text(option) },
                            leadingIcon = if (isSelected) {
                                { Icon(Icons.Filled.Star, contentDescription = null, modifier = Modifier.size(14.dp)) }
                            } else null
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DescriptionTab(html: String) {
    if (html.isBlank()) {
        Text("—", modifier = Modifier.padding(16.dp))
    } else {
        HtmlText(html = html, modifier = Modifier.padding(16.dp))
    }
}

@Composable
private fun SpecsTab(product: Product) {
    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(0.dp)) {
        if (product.sku.isNotBlank()) SpecRow("کد کالا", product.sku)
        product.attributes.forEach { attr ->
            if (attr.options.isNotEmpty()) SpecRow(attr.name, attr.options.joinToString("، "))
        }
        if (product.attributes.isEmpty() && product.sku.isBlank()) {
            Text("مشخصاتی ثبت نشده است", style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
private fun SpecRow(name: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(name, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1.5f))
    }
}

@Composable
private fun ReviewsTab(reviews: List<Review>) {
    if (reviews.isEmpty()) {
        Text(stringResource(R.string.no_reviews), modifier = Modifier.padding(16.dp))
        return
    }
    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        reviews.forEach { review ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(Modifier.padding(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text(review.author.ifBlank { "کاربر" }, style = MaterialTheme.typography.titleSmall)
                        RatingRow(review.rating.toFloat(), 0)
                    }
                    if (review.dateIso.isNotBlank()) {
                        Text(
                            JalaliDate.fromIso(review.dateIso),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(review.text, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
}
        }
    }
}
