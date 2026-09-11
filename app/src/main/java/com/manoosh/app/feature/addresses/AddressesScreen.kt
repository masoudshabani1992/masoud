package com.manoosh.app.feature.addresses

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.session.SessionManager
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.data.repository.AddressesRepository
import com.manoosh.app.data.repository.OrderRepository
import com.manoosh.app.domain.CheckoutAddress
import com.manoosh.app.domain.SavedAddress
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@HiltViewModel
class AddressesViewModel @Inject constructor(
    private val addresses: AddressesRepository,
    private val orders: OrderRepository,
    private val session: SessionManager
) : ViewModel() {

    val list: StateFlow<List<SavedAddress>> = addresses.addresses.stateIn(
        scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = emptyList()
    )

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    fun save(saved: SavedAddress) {
        viewModelScope.launch {
            addresses.save(saved)
            // Best-effort sync of the default address to the WooCommerce profile.
            try {
                val s = session.sessionFlow.first()
                if (s.loggedIn && s.customerId > 0) {
                    orders.syncAddress(s.customerId, saved.address.firstName, saved.address.lastName, saved.address)
                }
            } catch (_: Exception) {
            }
            _messages.tryEmit("آدرس ذخیره شد")
        }
    }

    fun delete(id: String) {
        viewModelScope.launch { addresses.delete(id) }
    }
}

@Composable
fun AddressesScreen(
    onBack: () -> Unit,
    viewModel: AddressesViewModel = hiltViewModel()
) {
    val list by viewModel.list.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var editing by remember { mutableStateOf<SavedAddress?>(null) }
    var creating by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.addresses), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            FloatingActionButton(onClick = { creating = true }) {
                Icon(Icons.Filled.Add, contentDescription = stringResource(R.string.new_address))
            }
        }
    ) { padding ->
        if (list.isEmpty()) {
            EmptyState(
                title = stringResource(R.string.no_addresses),
                icon = Icons.Filled.LocationOn,
                actionLabel = stringResource(R.string.new_address),
                onAction = { creating = true },
                modifier = Modifier.padding(padding)
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(list, key = { it.id }) { saved ->
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                        Row(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(saved.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                Text(
                                    "${saved.address.firstName} ${saved.address.lastName} — ${saved.address.state}، ${saved.address.city}",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Text(saved.address.address1, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(saved.address.phone, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            IconButton(onClick = { editing = saved }) {
                                Icon(Icons.Filled.Edit, contentDescription = stringResource(R.string.edit_address))
                            }
                            IconButton(onClick = { viewModel.delete(saved.id) }) {
                                Icon(Icons.Filled.DeleteOutline, contentDescription = stringResource(R.string.delete), tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    }

    if (creating) {
        AddressDialog(
            initial = SavedAddress("", "خانه", CheckoutAddress()),
            title = stringResource(R.string.new_address),
            onDismiss = { creating = false },
            onSave = { viewModel.save(it); creating = false }
        )
    }
    editing?.let { saved ->
        AddressDialog(
            initial = saved,
            title = stringResource(R.string.edit_address),
            onDismiss = { editing = null },
            onSave = { viewModel.save(it); editing = null }
        )
    }
}

@Composable
private fun AddressDialog(
    initial: SavedAddress,
    title: String,
    onDismiss: () -> Unit,
    onSave: (SavedAddress) -> Unit
) {
    var formTitle by remember { mutableStateOf(initial.title) }
    var first by remember { mutableStateOf(initial.address.firstName) }
    var last by remember { mutableStateOf(initial.address.lastName) }
    var phone by remember { mutableStateOf(initial.address.phone) }
    var state by remember { mutableStateOf(initial.address.state) }
    var city by remember { mutableStateOf(initial.address.city) }
    var addr by remember { mutableStateOf(initial.address.address1) }
    var postcode by remember { mutableStateOf(initial.address.postcode) }
    var error by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(formTitle, { formTitle = it }, label = { Text(stringResource(R.string.address_title)) }, singleLine = true)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(first, { first = it }, label = { Text(stringResource(R.string.first_name)) }, singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(last, { last = it }, label = { Text(stringResource(R.string.last_name)) }, singleLine = true, modifier = Modifier.weight(1f))
                }
                OutlinedTextField(
                    phone, { phone = it.filter { c -> c.isDigit() }.take(11) },
                    label = { Text(stringResource(R.string.mobile)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), singleLine = true
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(state, { state = it }, label = { Text(stringResource(R.string.province)) }, singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(city, { city = it }, label = { Text(stringResource(R.string.city)) }, singleLine = true, modifier = Modifier.weight(1f))
                }
                OutlinedTextField(addr, { addr = it }, label = { Text(stringResource(R.string.address)) }, minLines = 2)
                OutlinedTextField(
                    postcode, { postcode = it.filter { c -> c.isDigit() }.take(10) },
                    label = { Text(stringResource(R.string.postcode)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true
                )
                if (error) {
                    Text(stringResource(R.string.fill_required), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            TextButton(onClick = {
                if (first.isBlank() || last.isBlank() || phone.length != 11 || city.isBlank() || addr.isBlank()) {
                    error = true
                    return@TextButton
                }
                onSave(
                    initial.copy(
                        title = formTitle.ifBlank { "آدرس" },
                        address = initial.address.copy(
                            firstName = first, lastName = last, phone = phone,
                            state = state, city = city, address1 = addr, postcode = postcode
                        )
                    )
                )
            }) { Text(stringResource(R.string.save)) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
        }
    }
}
