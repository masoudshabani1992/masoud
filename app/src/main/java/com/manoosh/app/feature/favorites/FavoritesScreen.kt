package com.manoosh.app.feature.favorites

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.core.ui.components.ProductGrid
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.data.repository.FavoritesRepository
import com.manoosh.app.domain.FavoriteItem
import com.manoosh.app.domain.Product
import com.manoosh.app.domain.ProductImage
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    favoritesRepository: FavoritesRepository,
    private val favorites: FavoritesRepository,
    private val cart: CartRepository
) : ViewModel() {

    val products: StateFlow<List<Product>> = favoritesRepository.favorites
        .map { list -> list.map { it.toProduct() } }
        .stateIn(scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = emptyList())

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    fun quickAdd(product: Product) {
        viewModelScope.launch {
            val res = cart.add(product.id, 1)
            if (res is ApiResult.Success) _messages.tryEmit("به سبد خرید اضافه شد")
            else _messages.tryEmit((res as ApiResult.Error).message)
        }
    }

    fun remove(product: Product) {
        viewModelScope.launch { favorites.remove(product.id) }
    }

    private fun FavoriteItem.toProduct() = Product(
        id = id,
        name = name,
        slug = "",
        permalink = permalink,
        sku = "",
        type = "simple",
        priceMinor = priceMinor,
        regularMinor = regularMinor,
        saleMinor = if (regularMinor != null && priceMinor != null && regularMinor > priceMinor) priceMinor else null,
        minorUnit = minorUnit,
        currencySuffix = suffix,
        images = listOf(ProductImage(imageUrl, imageUrl)),
        categories = emptyList(),
        shortDescription = "",
        description = "",
        rating = 0f,
        reviewCount = 0,
        purchasable = true,
        inStock = true,
        onSale = regularMinor != null && priceMinor != null && regularMinor > priceMinor,
        lowStockRemaining = null,
        soldIndividually = false,
        maxQty = 99,
        attributes = emptyList(),
        hasVariations = false
    )
}

@Composable
fun FavoritesScreen(
    onBack: () -> Unit,
    onProductClick: (Long) -> Unit,
    viewModel: FavoritesViewModel = hiltViewModel()
) {
    val products by viewModel.products.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.favorites), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        if (products.isEmpty()) {
            EmptyState(
                title = stringResource(R.string.no_favorites),
                icon = Icons.Filled.FavoriteBorder,
                modifier = Modifier.padding(padding)
            )
        } else {
            ProductGrid(
                products = products,
                onProductClick = { onProductClick(it.id) },
                onAdd = viewModel::quickAdd,
                onRemove = viewModel::remove,
                modifier = Modifier.fillMaxSize().padding(padding)
            )
        }
    }
}
