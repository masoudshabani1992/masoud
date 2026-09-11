package com.manoosh.app.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.BuildConfig
import com.manoosh.app.R
import com.manoosh.app.core.common.Config
import com.manoosh.app.core.session.UserPrefs
import com.manoosh.app.core.ui.components.ManooshTopBar
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val prefs: UserPrefs
) : ViewModel() {
    val theme: StateFlow<Int> = prefs.themeFlow.stateIn(
        scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = 0
    )

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    fun setTheme(mode: Int) {
        viewModelScope.launch { prefs.setTheme(mode) }
    }

    fun clearHistory() {
        viewModelScope.launch {
            prefs.clearRecentSearches()
            _messages.tryEmit("جستجوهای اخیر پاک شد")
        }
    }
}

@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onOpenUrl: (title: String, url: String) -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val theme by viewModel.theme.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.settings), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(12.dp)) {
                    Text(stringResource(R.string.theme), style = MaterialTheme.typography.titleSmall)
                    ThemeOption(label = stringResource(R.string.theme_system), selected = theme == 0) { viewModel.setTheme(0) }
                    ThemeOption(label = stringResource(R.string.theme_light), selected = theme == 1) { viewModel.setTheme(1) }
                    ThemeOption(label = stringResource(R.string.theme_dark), selected = theme == 2) { viewModel.setTheme(2) }
                }
            }
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(stringResource(R.string.clear_history), style = MaterialTheme.typography.bodyLarge)
                        TextButton(onClick = viewModel::clearHistory) { Text(stringResource(R.string.delete)) }
                    }
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(stringResource(R.string.website), style = MaterialTheme.typography.bodyLarge)
                        TextButton(onClick = { onOpenUrl("مانوش", Config.baseUrl) }) { Text("manooshorganic.com") }
                    }
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(stringResource(R.string.app_version), style = MaterialTheme.typography.bodyLarge)
                        Text(BuildConfig.VERSION_NAME, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

@Composable
private fun ThemeOption(label: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = selected, onClick = onClick, role = Role.RadioButton)
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(selected = selected, onClick = null)
        Text(label, style = MaterialTheme.typography.bodyLarge)
    }
}
