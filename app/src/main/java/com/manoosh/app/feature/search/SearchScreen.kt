package com.manoosh.app.feature.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.session.UserPrefs
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.core.ui.components.ProductGrid
import com.manoosh.app.data.repository.BrowseOptions
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.data.repository.ProductRepository
import com.manoosh.app.domain.Product
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SearchUiState(
    val query: String = "",
    val isLoading: Boolean = false,
    val results: List<Product> = emptyList(),
    val searched: Boolean = false
)

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val products: ProductRepository,
    private val cart: CartRepository,
    private val prefs: UserPrefs
) : ViewModel() {

    private val _state = MutableStateFlow(SearchUiState())
    val state: StateFlow<SearchUiState> = _state.asStateFlow()

    val recent: StateFlow<List<String>> = prefs.recentSearches.stateIn(
        scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = emptyList()
    )

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private var searchJob: Job? = null

    fun onQueryChange(q: String) {
        _state.update { it.copy(query = q) }
        searchJob?.cancel()
        if (q.trim().length < 2) {
            _state.update { it.copy(results = emptyList(), searched = false, isLoading = false) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(500)
            _state.update { it.copy(isLoading = true) }
            val res = products.products(BrowseOptions(search = q.trim(), perPage = 12))
            _state.update {
                it.copy(
                    isLoading = false,
                    searched = true,
                    results = (res as? ApiResult.Success)?.data.orEmpty()
                )
            }
        }
    }

    fun submit(onDone: (String) -> Unit) {
        val q = _state.value.query.trim()
        if (q.length < 2) return
        viewModelScope.launch { prefs.addRecentSearch(q) }
        onDone(q)
    }

    fun useRecent(q: String, onDone: (String) -> Unit) {
        _state.update { it.copy(query = q) }
        viewModelScope.launch { prefs.addRecentSearch(q) }
        onDone(q)
    }

    fun clearRecent() {
        viewModelScope.launch { prefs.clearRecentSearches() }
    }

    fun quickAdd(product: Product) {
        viewModelScope.launch {
            val res = cart.add(product.id, 1)
            if (res is ApiResult.Success) _messages.tryEmit("به سبد خرید اضافه شد")
            else _messages.tryEmit((res as ApiResult.Error).message)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(
    onBack: () -> Unit,
    onProductClick: (Long) -> Unit,
    onSubmitQuery: (String) -> Unit,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val recent by viewModel.recent.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val focusRequester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.search_title), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = state.query,
                onValueChange = viewModel::onQueryChange,
                placeholder = { Text(stringResource(R.string.search_hint)) },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                trailingIcon = {
                    if (state.query.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onQueryChange("") }) {
                            Icon(Icons.Filled.Clear, contentDescription = null)
                        }
                    }
                },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { viewModel.submit(onSubmitQuery) }),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .focusRequester(focusRequester)
            )

            if (state.query.trim().length < 2) {
                // Recent searches.
                if (recent.isNotEmpty()) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(stringResource(R.string.recent_searches), style = MaterialTheme.typography.titleSmall)
                        TextButton(onClick = viewModel::clearRecent) { Text(stringResource(R.string.clear_history)) }
                    }
                    FlowRow(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        recent.forEach { q ->
                            AssistChip(
                                onClick = { viewModel.useRecent(q, onSubmitQuery) },
                                label = { Text(q) },
                                leadingIcon = { Icon(Icons.Filled.History, contentDescription = null) }
                            )
                        }
                    }
                }
            } else if (state.isLoading && state.results.isEmpty()) {
                Row(Modifier.fillMaxWidth().padding(32.dp), horizontalArrangement = Arrangement.Center) {
                    CircularProgressIndicator()
                }
            } else if (state.searched && state.results.isEmpty()) {
                EmptyState(
                    title = stringResource(R.string.no_results),
                    hint = stringResource(R.string.try_other_keywords),
                    modifier = Modifier.weight(1f)
                )
            } else {
                ProductGrid(
                    products = state.results,
                    onProductClick = { onProductClick(it.id) },
                    onAdd = viewModel::quickAdd,
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}
