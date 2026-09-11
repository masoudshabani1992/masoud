package com.manoosh.app.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.session.UserPrefs
import com.manoosh.app.core.ui.components.BannerSlider
import com.manoosh.app.core.ui.components.CountdownChip
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.ErrorState
import com.manoosh.app.core.ui.components.HomeSearchBar
import com.manoosh.app.core.ui.components.LoadingBox
import com.manoosh.app.core.ui.components.ProductCard
import com.manoosh.app.core.ui.components.ProductRail
import com.manoosh.app.core.ui.components.SectionHeader
import com.manoosh.app.core.ui.theme.OfferRed
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.data.repository.CategoryRepository
import com.manoosh.app.data.repository.HomeRepository
import com.manoosh.app.domain.BannerUi
import com.manoosh.app.domain.Category
import com.manoosh.app.domain.Product
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class FeaturedRail(val id: Long, val title: String, val products: List<Product>)

data class HomeUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val isNetworkError: Boolean = false,
    val banners: List<BannerUi> = emptyList(),
    val categories: List<Category> = emptyList(),
    val amazing: List<Product> = emptyList(),
    val amazingTitle: String = "",
    val amazingDeadline: Long = 0L,
    val newest: List<Product> = emptyList(),
    val bestSellers: List<Product> = emptyList(),
    val featuredRails: List<FeaturedRail> = emptyList()
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeRepository: HomeRepository,
    private val categoryRepository: CategoryRepository,
    private val cartRepository: CartRepository,
    private val userPrefs: UserPrefs
) : ViewModel() {

    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val configDeferred = async { homeRepository.homeConfig() }
            val catsDeferred = async { categoryRepository.categories() }
            val amazingDeferred = async { homeRepository.amazing() }
            val newestDeferred = async { homeRepository.newest() }
            val bestDeferred = async { homeRepository.bestSellers() }

            val config = configDeferred.await().getOrNull()
            val cats = catsDeferred.await()
            val amazing = amazingDeferred.await()
            val newest = newestDeferred.await()
            val best = bestDeferred.await()

            if (cats is ApiResult.Error && newest is ApiResult.Error) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        error = (newest as ApiResult.Error).message,
                        isNetworkError = newest.isNetwork
                    )
                }
                return@launch
            }

            val roots = (cats as? ApiResult.Success)?.data?.filter { it.parentId == 0L }.orEmpty()
            val featuredIds = config?.featuredCategoryIds.orEmpty().take(3)
            val rails = featuredIds.mapNotNull { id ->
                val title = roots.firstOrNull { it.id == id }?.name
                    ?: cats.getOrNull()?.firstOrNull { it.id == id }?.name
                    ?: return@mapNotNull null
                val res = homeRepository.categoryRail(id)
                val list = res.getOrNull().orEmpty()
                if (list.isEmpty()) null else FeaturedRail(id, title, list)
            }

            // Amazing countdown anchor (client-side, refreshed when expired).
            var deadline = try { userPrefs.amazingDeadline.first() } catch (_: Exception) { 0L }
            if (deadline < System.currentTimeMillis()) {
                deadline = System.currentTimeMillis() + (config?.amazingHours ?: 24) * 3600_000L
                userPrefs.setAmazingDeadline(deadline)
            }

            _state.update {
                it.copy(
                    isLoading = false,
                    error = null,
                    banners = config?.banners.orEmpty(),
                    categories = roots,
                    amazing = amazing.getOrNull().orEmpty(),
                    amazingTitle = config?.amazingTitle ?: "پیشنهاد شگفت‌انگیز",
                    amazingDeadline = deadline,
                    newest = newest.getOrNull().orEmpty(),
                    bestSellers = best.getOrNull().orEmpty(),
                    featuredRails = rails
                )
            }
        }
    }

    fun quickAdd(product: Product) {
        viewModelScope.launch {
            val res = cartRepository.add(product.id, 1)
            if (res is ApiResult.Success) _messages.tryEmit("به سبد خرید اضافه شد")
            else _messages.tryEmit((res as ApiResult.Error).message)
        }
    }
}

@Composable
fun HomeScreen(
    onProductClick: (Long) -> Unit,
    onBrowse: (categoryId: Long?, title: String, onSale: Boolean) -> Unit,
    onSearchClick: () -> Unit,
    onOpenUrl: (title: String, url: String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        when {
            state.isLoading -> LoadingBox(Modifier.padding(padding))
            state.error != null -> ErrorState(
                message = state.error.orEmpty(),
                isNetwork = state.isNetworkError,
                onRetry = viewModel::refresh,
                modifier = Modifier.padding(padding)
            )
            else -> LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                item {
                    HomeSearchBar(
                        onClick = onSearchClick,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                if (state.banners.isNotEmpty()) {
                    item {
                        BannerSlider(
                            banners = state.banners,
                            onBannerClick = { banner ->
                                when (banner.linkType) {
                                    "product" -> banner.linkValue.toLongOrNull()?.let(onProductClick)
                                    "category" -> banner.linkValue.toLongOrNull()?.let {
                                        onBrowse(it, banner.title, false)
                                    }
                                    "url" -> if (banner.linkValue.isNotBlank()) {
                                        onOpenUrl(banner.title, banner.linkValue)
                                    }
                                }
                            }
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
                if (state.categories.isNotEmpty()) {
                    item {
                        SectionHeader(title = stringResource(R.string.shop_by_category))
                        CategoryCircles(
                            categories = state.categories,
                            onClick = { onBrowse(it.id, it.name, false) }
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
                if (state.amazing.isNotEmpty()) {
                    item {
                        AmazingSection(
                            title = state.amazingTitle,
                            deadline = state.amazingDeadline,
                            products = state.amazing,
                            onProductClick = onProductClick,
                            onAdd = viewModel::quickAdd,
                            onSeeAll = { onBrowse(null, state.amazingTitle, true) }
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
                if (state.newest.isNotEmpty()) {
                    item {
                        ProductRail(
                            title = stringResource(R.string.new_arrivals),
                            products = state.newest,
                            onProductClick = { onProductClick(it.id) },
                            onAdd = viewModel::quickAdd,
                            onSeeAll = { onBrowse(null, "", false) }
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
                state.featuredRails.forEach { rail ->
                    item {
                        ProductRail(
                            title = rail.title,
                            products = rail.products,
                            onProductClick = { onProductClick(it.id) },
                            onAdd = viewModel::quickAdd,
                            onSeeAll = { onBrowse(rail.id, rail.title, false) }
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
                if (state.bestSellers.isNotEmpty()) {
                    item {
                        ProductRail(
                            title = stringResource(R.string.best_sellers),
                            products = state.bestSellers,
                            onProductClick = { onProductClick(it.id) },
                            onAdd = viewModel::quickAdd,
                            onSeeAll = { onBrowse(null, "", false) }
                        )
                    }
                }
                if (state.amazing.isEmpty() && state.newest.isEmpty() && state.bestSellers.isEmpty()) {
                    item {
                        EmptyState(
                            title = stringResource(R.string.no_results),
                            onAction = null,
                            actionLabel = null
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CategoryCircles(categories: List<Category>, onClick: (Category) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(categories, key = { it.id }) { cat ->
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .width(72.dp)
                    .clickable { onClick(cat) }
            ) {
                AsyncImage(
                    model = cat.imageUrl,
                    contentDescription = cat.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    cat.name,
                    style = MaterialTheme.typography.labelSmall,
                    maxLines = 2,
                    minLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

@Composable
private fun AmazingSection(
    title: String,
    deadline: Long,
    products: List<Product>,
    onProductClick: (Long) -> Unit,
    onAdd: (Product) -> Unit,
    onSeeAll: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(OfferRed)
            .padding(vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = androidx.compose.ui.graphics.Color.White
            )
            CountdownChip(deadlineMillis = deadline)
        }
        Spacer(Modifier.height(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(products, key = { it.id }) { product ->
                ProductCard(
                    product = product,
                    onClick = { onProductClick(product.id) },
                    onAdd = { onAdd(product) },
                    modifier = Modifier.width(160.dp)
                )
            }
        }
        Text(
            text = stringResource(R.string.see_all),
            style = MaterialTheme.typography.labelLarge,
            color = androidx.compose.ui.graphics.Color.White,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(top = 8.dp)
                .clickable { onSeeAll() }
                .padding(8.dp)
        )
    }
}
