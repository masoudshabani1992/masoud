package com.manoosh.app.feature.browse

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Constants
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.ErrorState
import com.manoosh.app.core.ui.components.LoadingGrid
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.core.ui.components.ProductGrid
import com.manoosh.app.data.repository.BrowseOptions
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.data.repository.ProductRepository
import com.manoosh.app.domain.Product
import com.manoosh.app.domain.SortOption
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

data class BrowseUiState(
    val title: String = "",
    val isLoading: Boolean = true,
    val isLoadingMore: Boolean = false,
    val error: String? = null,
    val isNetworkError: Boolean = false,
    val products: List<Product> = emptyList(),
    val hasMore: Boolean = false,
    val sort: SortOption = SortOption.NEWEST,
    val inStockOnly: Boolean = false,
    val onSaleOnly: Boolean = false,
    val minPrice: String = "",
    val maxPrice: String = "",
    val showSortSheet: Boolean = false,
    val showFilterSheet: Boolean = false
) {
    val hasActiveFilters: Boolean get() = inStockOnly || onSaleOnly || minPrice.isNotBlank() || maxPrice.isNotBlank()
}

@HiltViewModel
class BrowseViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val products: ProductRepository,
    private val cartRepository: CartRepository
) : ViewModel() {

    private val categoryId: Long? = savedStateHandle.get<Long>("categoryId")?.takeIf { it > 0 }
    private val initialQuery: String = savedStateHandle.get<String>("query").orEmpty()
    private val initialOnSale: Boolean = savedStateHandle.get<Boolean>("onSale") ?: false
    private val initialTitle: String = savedStateHandle.get<String>("title").orEmpty()

    private val _state = MutableStateFlow(
        BrowseUiState(
            title = initialTitle.ifBlank { initialQuery.ifBlank { "فروشگاه" } },
            onSaleOnly = initialOnSale
        )
    )
    val state: StateFlow<BrowseUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private var page = 1

    init {
        load(reset = true)
    }

    fun load(reset: Boolean = false) {
        val s = _state.value
        if (reset) {
            page = 1
            _state.update { it.copy(isLoading = true, error = null, products = emptyList()) }
        } else {
            if (s.isLoadingMore || !s.hasMore) return
            _state.update { it.copy(isLoadingMore = true) }
        }
        viewModelScope.launch {
            val options = BrowseOptions(
                categoryId = categoryId,
                search = initialQuery.ifBlank { null },
                sort = _state.value.sort,
                onSaleOnly = _state.value.onSaleOnly,
                inStockOnly = _state.value.inStockOnly,
                minPrice = _state.value.minPrice.toLongOrNull(),
                maxPrice = _state.value.maxPrice.toLongOrNull(),
                page = page,
                perPage = Constants.PAGE_SIZE
            )
            when (val res = products.products(options)) {
                is ApiResult.Success -> {
                    val list = if (reset) res.data else _state.value.products + res.data
                    if (res.data.isNotEmpty()) page++
                    _state.update {
                        it.copy(
                            isLoading = false,
                            isLoadingMore = false,
                            products = list,
                            hasMore = res.data.size >= Constants.PAGE_SIZE
                        )
                    }
                }
                is ApiResult.Error -> _state.update {
                    it.copy(isLoading = false, isLoadingMore = false, error = res.message, isNetworkError = res.isNetwork)
                }
            }
        }
    }

    fun setSort(sort: SortOption) {
        _state.update { it.copy(sort = sort, showSortSheet = false) }
        load(reset = true)
    }

    fun setSheets(sort: Boolean, filter: Boolean) {
        _state.update { it.copy(showSortSheet = sort, showFilterSheet = filter) }
    }

    fun applyFilters(inStock: Boolean, onSale: Boolean, min: String, max: String) {
        _state.update {
            it.copy(
                inStockOnly = inStock, onSaleOnly = onSale,
                minPrice = min.filter { c -> c.isDigit() },
                maxPrice = max.filter { c -> c.isDigit() },
                showFilterSheet = false
            )
        }
        load(reset = true)
    }

    fun clearFilters() {
        _state.update { it.copy(inStockOnly = false, onSaleOnly = false, minPrice = "", maxPrice = "", showFilterSheet = false) }
        load(reset = true)
    }

    fun quickAdd(product: Product) {
        viewModelScope.launch {
            val res = cartRepository.add(product.id, 1)
            if (res is ApiResult.Success) _messages.tryEmit("به سبد خرید اضافه شد")
            else _messages.tryEmit((res as ApiResult.Error).message)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BrowseScreen(
    onBack: () -> Unit,
    onProductClick: (Long) -> Unit,
    viewModel: BrowseViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = state.title, onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Sort / filter bar (Digikala style).
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { viewModel.setSheets(sort = true, filter = false) },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Filled.Sort, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text(sortLabel(state.sort))
                }
                OutlinedButton(
                    onClick = { viewModel.setSheets(sort = false, filter = true) },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Filled.Tune, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text(
                        if (state.hasActiveFilters) "${stringResource(R.string.filter)} •"
                        else stringResource(R.string.filter)
                    )
                }
            }
            when {
                state.isLoading -> LoadingGrid(Modifier.weight(1f))
                state.error != null && state.products.isEmpty() -> ErrorState(
                    message = state.error.orEmpty(),
                    isNetwork = state.isNetworkError,
                    onRetry = { viewModel.load(reset = true) },
                    modifier = Modifier.weight(1f)
                )
                state.products.isEmpty() -> EmptyState(
                    title = stringResource(R.string.no_results),
                    hint = stringResource(R.string.try_other_keywords),
                    modifier = Modifier.weight(1f)
                )
                else -> ProductGrid(
                    products = state.products,
                    onProductClick = { onProductClick(it.id) },
                    onAdd = viewModel::quickAdd,
                    hasMore = state.hasMore,
                    isLoadingMore = state.isLoadingMore,
                    onLoadMore = { viewModel.load(reset = false) },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        if (state.showSortSheet) {
            ModalBottomSheet(
                onDismissRequest = { viewModel.setSheets(sort = false, filter = false) },
                sheetState = rememberModalBottomSheetState()
            ) {
                Column(Modifier.padding(bottom = 24.dp)) {
                    Text(
                        stringResource(R.string.sort),
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(16.dp)
                    )
                    SortOption.entries.forEach { option ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .selectable(
                                    selected = option == state.sort,
                                    onClick = { viewModel.setSort(option) },
                                    role = Role.RadioButton
                                )
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(selected = option == state.sort, onClick = null)
                            Spacer(Modifier.width(8.dp))
                            Text(sortLabel(option))
                        }
                    }
                }
            }
        }

        if (state.showFilterSheet) {
            FilterSheet(
                inStock = state.inStockOnly,
                onSale = state.onSaleOnly,
                min = state.minPrice,
                max = state.maxPrice,
                onDismiss = { viewModel.setSheets(sort = false, filter = false) },
                onApply = viewModel::applyFilters,
                onClear = viewModel::clearFilters
            )
        }
    }
}

@Composable
private fun sortLabel(sort: SortOption): String = when (sort) {
    SortOption.NEWEST -> stringResource(R.string.sort_newest)
    SortOption.CHEAPEST -> stringResource(R.string.sort_cheapest)
    SortOption.EXPENSIVE -> stringResource(R.string.sort_expensive)
    SortOption.POPULAR -> stringResource(R.string.sort_popular)
    SortOption.RATING -> stringResource(R.string.sort_rating)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterSheet(
    inStock: Boolean,
    onSale: Boolean,
    min: String,
    max: String,
    onDismiss: () -> Unit,
    onApply: (Boolean, Boolean, String, String) -> Unit,
    onClear: () -> Unit
) {
    var stock by remember { mutableStateOf(inStock) }
    var sale by remember { mutableStateOf(onSale) }
    var minV by remember { mutableStateOf(min) }
    var maxV by remember { mutableStateOf(max) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState()
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(stringResource(R.string.filter), style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Text(stringResource(R.string.only_available))
                Switch(checked = stock, onCheckedChange = { stock = it })
            }
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Text(stringResource(R.string.only_on_sale))
                Switch(checked = sale, onCheckedChange = { sale = it })
            }
            Spacer(Modifier.height(8.dp))
            Text(stringResource(R.string.price_range), style = MaterialTheme.typography.titleSmall)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = minV,
                    onValueChange = { minV = it.filter { c -> c.isDigit() }.take(12) },
                    label = { Text(stringResource(R.string.min_price)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = maxV,
                    onValueChange = { maxV = it.filter { c -> c.isDigit() }.take(12) },
                    label = { Text(stringResource(R.string.max_price)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { onApply(stock, sale, minV, maxV) }, modifier = Modifier.weight(1f)) {
                    Text(stringResource(R.string.apply))
                }
                TextButton(onClick = onClear) { Text(stringResource(R.string.clear)) }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
