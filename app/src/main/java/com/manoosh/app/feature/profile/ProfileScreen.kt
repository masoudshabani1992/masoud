package com.manoosh.app.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.HeadsetMic
import androidx.compose.material.icons.filled.InfoOutline
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.Config
import com.manoosh.app.core.common.Constants
import com.manoosh.app.core.common.faDigits
import com.manoosh.app.core.session.SessionManager
import com.manoosh.app.core.session.SessionState
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class ProfileViewModel @Inject constructor(
    sessionManager: SessionManager,
    private val auth: AuthRepository
) : ViewModel() {
    val session: StateFlow<SessionState> = sessionManager.sessionFlow.stateIn(
        scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = SessionState()
    )

    fun logout() {
        viewModelScope.launch { auth.logout() }
    }
}

@Composable
fun ProfileScreen(
    onLoginClick: () -> Unit,
    onOrders: () -> Unit,
    onFavorites: () -> Unit,
    onAddresses: () -> Unit,
    onSettings: () -> Unit,
    onOpenUrl: (title: String, url: String) -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val session by viewModel.session.collectAsStateWithLifecycle()
    var showLogout by remember { mutableStateOf(false) }
    var showAbout by remember { mutableStateOf(false) }

    Scaffold(topBar = { ManooshTopBar(title = stringResource(R.string.nav_profile)) }) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (session.loggedIn) {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(56.dp).clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                session.userName.firstOrNull()?.toString() ?: "م",
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(session.userName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(session.phone.faDigits(), style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            } else {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Column(modifier = Modifier.fillMaxWidth().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Filled.Person, contentDescription = null, modifier = Modifier.size(48.dp))
                        Spacer(Modifier.height(8.dp))
                        Text(stringResource(R.string.login_prompt), style = MaterialTheme.typography.bodyLarge)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onLoginClick, modifier = Modifier.fillMaxWidth()) {
                            Text(stringResource(R.string.login_button))
                        }
                    }
                }
            }

            MenuCard {
                MenuRow(
                    icon = Icons.Filled.ReceiptLong,
                    title = stringResource(R.string.my_orders),
                    onClick = { if (session.loggedIn) onOrders() else onLoginClick() }
                )
                MenuRow(icon = Icons.Filled.FavoriteBorder, title = stringResource(R.string.favorites), onClick = onFavorites)
                MenuRow(icon = Icons.Filled.LocationOn, title = stringResource(R.string.addresses), onClick = onAddresses)
            }

            MenuCard {
                MenuRow(
                    icon = Icons.AutoMirrored.Filled.MenuBook,
                    title = stringResource(R.string.magazine),
                    onClick = { onOpenUrl("مجله مانوش", Config.baseUrl + Constants.MAGAZINE_PATH) }
                )
                MenuRow(
                    icon = Icons.Filled.HeadsetMic,
                    title = stringResource(R.string.support),
                    onClick = { onOpenUrl("تماس با ما", Config.baseUrl + Constants.CONTACT_PATH) }
                )
                MenuRow(icon = Icons.Filled.Settings, title = stringResource(R.string.settings), onClick = onSettings)
                MenuRow(icon = Icons.Filled.InfoOutline, title = stringResource(R.string.about), onClick = { showAbout = true })
            }

            if (session.loggedIn) {
                OutlinedButton(
                    onClick = { showLogout = true },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(R.string.logout))
                }
            }
        }
    }

    if (showLogout) {
        AlertDialog(
            onDismissRequest = { showLogout = false },
            text = { Text(stringResource(R.string.logout_confirm)) },
            confirmButton = {
                TextButton(onClick = { showLogout = false; viewModel.logout() }) { Text(stringResource(R.string.yes)) }
            },
            dismissButton = {
                TextButton(onClick = { showLogout = false }) { Text(stringResource(R.string.no)) }
            }
        )
    }
    if (showAbout) {
        AlertDialog(
            onDismissRequest = { showAbout = false },
            title = { Text(stringResource(R.string.about)) },
            text = { Text("مانوش؛ فروشگاه آنلاین محصولات ارگانیک و طبیعی.\nmanooshorganic.com") },
            confirmButton = {
                TextButton(onClick = { showAbout = false }) { Text(stringResource(R.string.ok)) }
            }
        )
    }
}

@Composable
private fun MenuCard(content: @Composable () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(Modifier.padding(vertical = 4.dp)) { content() }
    }
}

@Composable
private fun MenuRow(icon: ImageVector, title: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable { onClick() }.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Spacer(Modifier.width(12.dp))
        Text(title, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
