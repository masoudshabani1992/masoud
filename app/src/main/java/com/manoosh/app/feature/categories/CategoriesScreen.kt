package com.manoosh.app.feature.categories

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.manoosh.app.core.ui.components.ErrorState
import com.manoosh.app.core.ui.components.HomeSearchBar
import com.manoosh.app.core.ui.components.LoadingBox
import com.manoosh.app.data.repository.CategoryRepository
import com.manoosh.app.core.ui.theme.ImageShape
import com.manoosh.app.domain.Category
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CategoriesUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val isNetworkError: Boolean = false,
    val roots: List<Category> = emptyList(),
    val selectedParentId: Long = 0L,
    val children: List<Category> = emptyList()
)

@HiltViewModel
class CategoriesViewModel @Inject constructor(
    private val repository: CategoryRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CategoriesUiState())
    val state: StateFlow<CategoriesUiState> = _state.asStateFlow()

    private var all: List<Category> = emptyList()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val res = repository.categories(forceRefresh = true)) {
                is ApiResult.Success -> {
                    all = res.data
                    val roots = all.filter { it.parentId == 0L }
                    val first = roots.firstOrNull()?.id ?: 0L
                    _state.update {
                        it.copy(
                            isLoading = false,
                            roots = roots,
                            selectedParentId = first,
                            children = all.filter { c -> c.parentId == first }
                        )
                    }
                }
                is ApiResult.Error -> _state.update {
                    it.copy(isLoading = false, error = res.message, isNetworkError = res.isNetwork)
                }
            }
        }
    }

    fun selectParent(id: Long) {
        _state.update { it.copy(selectedParentId = id, children = all.filter { c -> c.parentId == id }) }
    }
}

@Composable
fun CategoriesScreen(
    onBrowse: (categoryId: Long, title: String) -> Unit,
    onSearchClick: () -> Unit,
    viewModel: CategoriesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            HomeSearchBar(
                onClick = onSearchClick,
                modifier = Modifier.padding(16.dp)
            )
            when {
                state.isLoading -> LoadingBox(Modifier.weight(1f))
                state.error != null -> ErrorState(
                    message = state.error.orEmpty(),
                    isNetwork = state.isNetworkError,
                    onRetry = viewModel::refresh,
                    modifier = Modifier.weight(1f)
                )
                else -> Row(Modifier.weight(1f)) {
                    // Parent list (right side in RTL, like Digikala).
                    LazyColumn(
                        modifier = Modifier
                            .width(112.dp)
                            .fillMaxHeight()
                            .background(MaterialTheme.colorScheme.surface),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        items(state.roots, key = { it.id }) { parent ->
                            val selected = parent.id == state.selectedParentId
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.selectParent(parent.id) }
                                    .background(
                                        if (selected) MaterialTheme.colorScheme.primaryContainer
                                        else MaterialTheme.colorScheme.surface
                                    )
                                    .padding(vertical = 12.dp, horizontal = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    parent.name,
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selected) MaterialTheme.colorScheme.onPrimaryContainer
                                    else MaterialTheme.colorScheme.onSurface,
                                    textAlign = TextAlign.Center,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                    // Children grid.
                    val parent = state.roots.firstOrNull { it.id == state.selectedParentId }
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(3),
                        modifier = Modifier.weight(1f).fillMaxHeight(),
                        contentPadding = PaddingValues(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        if (parent != null) {
                            item {
                                ChildTile(
                                    name = stringResource(R.string.see_all),
                                    imageUrl = parent.imageUrl,
                                    onClick = { onBrowse(parent.id, parent.name) }
                                )
                            }
                        }
                        items(state.children, key = { it.id }) { child ->
                            ChildTile(
                                name = child.name,
                                imageUrl = child.imageUrl,
                                onClick = { onBrowse(child.id, child.name) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChildTile(name: String, imageUrl: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        AsyncImage(
            model = imageUrl,
            contentDescription = name,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(76.dp)
                .clip(ImageShape)
                .background(MaterialTheme.colorScheme.surfaceVariant)
        )
        Spacer(Modifier.height(4.dp))
        Text(
            name,
            style = MaterialTheme.typography.labelSmall,
            textAlign = TextAlign.Center,
            maxLines = 2,
            minLines = 2,
            overflow = TextOverflow.Ellipsis
        )
    }
}
