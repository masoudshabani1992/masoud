package com.manoosh.app.feature.checkout

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Constants
import com.manoosh.app.core.common.formatMoney
import com.manoosh.app.core.session.SessionManager
import com.manoosh.app.core.session.SessionState
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.LoadingBox
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.data.repository.AddressesRepository
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.data.repository.CheckoutRepository
import com.manoosh.app.domain.CheckoutAddress
import com.manoosh.app.domain.PaymentMethodUi
import com.manoosh.app.domain.SavedAddress
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
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

data class CheckoutUiState(
    val step: Int = 0,
    val isLoading: Boolean = true,
    val working: Boolean = false,
    val address: CheckoutAddress = CheckoutAddress(),
    val savedAddresses: List<SavedAddress> = emptyList(),
    val selectedSavedId: String? = null,
    val paymentMethods: List<PaymentMethodUi> = emptyList(),
    val selectedPayment: String = "",
    val note: String = "",
    val formError: String? = null
)

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    private val checkoutRepository: CheckoutRepository,
    private val addressesRepository: AddressesRepository,
    sessionManager: SessionManager
) : ViewModel() {

    val cart = cartRepository.cart

    val session: StateFlow<SessionState> = sessionManager.sessionFlow.stateIn(
        scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = SessionState()
    )

    private val _state = MutableStateFlow(CheckoutUiState())
    val state: StateFlow<CheckoutUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    sealed interface OrderPlaced {
        data class PayOnline(val orderId: Long, val url: String, val key: String) : OrderPlaced
        data class Done(val orderId: Long) : OrderPlaced
    }

    private val _orderPlaced = MutableSharedFlow<OrderPlaced>(extraBufferCapacity = 1)
    val orderPlaced: SharedFlow<OrderPlaced> = _orderPlaced.asSharedFlow()

    init {
        viewModelScope.launch {
            val res = cartRepository.refresh()
            if (res is ApiResult.Error) _messages.tryEmit(res.message)
            addressesRepository.addresses.collect { list ->
                _state.update { s ->
                    var next = s.copy(savedAddresses = list)
                    if (s.selectedSavedId == null && list.isNotEmpty() && s.address.firstName.isBlank()) {
                        next = next.copy(address = list.first().address, selectedSavedId = list.first().id)
                    }
                    next.copy(isLoading = false)
                }
            }
        }
        viewModelScope.launch {
            val pm = checkoutRepository.paymentMethods()
            if (pm is ApiResult.Success) {
                _state.update { it.copy(paymentMethods = pm.data, selectedPayment = pm.data.firstOrNull()?.id.orEmpty()) }
            }
        }
    }

    fun updateAddress(address: CheckoutAddress) {
        _state.update { it.copy(address = address, selectedSavedId = null, formError = null) }
    }

    fun pickSaved(saved: SavedAddress) {
        _state.update { it.copy(address = saved.address, selectedSavedId = saved.id, formError = null) }
    }

    fun selectPayment(id: String) {
        _state.update { it.copy(selectedPayment = id) }
    }

    fun setNote(note: String) {
        _state.update { it.copy(note = note) }
    }

    fun nextFromAddress() {
        val a = _state.value.address
        val phone = Constants.normalizePhone(a.phone)
        val error = when {
            a.firstName.isBlank() || a.lastName.isBlank() -> "fill"
            !Constants.isValidIranMobile(phone) -> "mobile"
            a.city.isBlank() || a.address1.isBlank() -> "fill"
            else -> null
        }
        if (error != null) {
            _state.update { it.copy(formError = error) }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(working = true) }
            val fixed = a.copy(phone = phone)
            val res = cartRepository.updateCustomer(fixed, fixed)
            _state.update { it.copy(working = false) }
            if (res is ApiResult.Success) {
                _state.update { it.copy(address = fixed, step = 1) }
            } else {
                _messages.tryEmit((res as ApiResult.Error).message)
            }
        }
    }

    fun selectShipping(packageId: String, rateId: String) {
        viewModelScope.launch {
            _state.update { it.copy(working = true) }
            val res = cartRepository.selectShipping(packageId, rateId)
            _state.update { it.copy(working = false) }
            if (res is ApiResult.Error) _messages.tryEmit(res.message)
        }
    }

    fun goStep(step: Int) {
        _state.update { it.copy(step = step.coerceIn(0, 2)) }
    }

    fun placeOrder() {
        val s = _state.value
        if (s.selectedPayment.isBlank()) {
            _messages.tryEmit("روش پرداخت را انتخاب کنید")
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(working = true) }
            val res = checkoutRepository.placeOrder(s.address, s.address, s.selectedPayment, s.note)
            _state.update { it.copy(working = false) }
            when (res) {
                is ApiResult.Success -> {
                    val r = res.data
                    cartRepository.resetAfterOrder()
                    if (r.needsWebView && r.redirectUrl != null) {
                        _orderPlaced.tryEmit(OrderPlaced.PayOnline(r.orderId, r.redirectUrl, r.orderKey))
                    } else {
                        _orderPlaced.tryEmit(OrderPlaced.Done(r.orderId))
                    }
                }
                is ApiResult.Error -> _messages.tryEmit(res.message)
            }
        }
    }
}

@Composable
fun CheckoutScreen(
    onBack: () -> Unit,
    onPaid: (Long) -> Unit,
    onPayOnline: (orderId: Long, url: String, key: String) -> Unit,
    onLoginClick: () -> Unit,
    viewModel: CheckoutViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val cart by viewModel.cart.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }
    LaunchedEffect(Unit) {
        viewModel.orderPlaced.collect { event ->
            when (event) {
                is CheckoutViewModel.OrderPlaced.PayOnline -> onPayOnline(event.orderId, event.url, event.key)
                is CheckoutViewModel.OrderPlaced.Done -> onPaid(event.orderId)
            }
        }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.checkout_title), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        if (state.isLoading) {
            LoadingBox(Modifier.padding(padding))
            return@Scaffold
        }
        if (cart.isEmpty) {
            EmptyState(title = stringResource(R.string.cart_empty), modifier = Modifier.padding(padding))
            return@Scaffold
        }
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item { StepIndicator(step = state.step) }
            when (state.step) {
                0 -> item {
                    AddressStep(
                        address = state.address,
                        saved = state.savedAddresses,
                        selectedId = state.selectedSavedId,
                        formError = state.formError,
                        working = state.working,
                        onAddress = viewModel::updateAddress,
                        onPick = viewModel::pickSaved,
                        onNext = viewModel::nextFromAddress
                    )
                }
                1 -> item {
                    ShippingStep(
                        cart = cart,
                        working = state.working,
                        onSelect = viewModel::selectShipping,
                        onNext = { viewModel.goStep(2) },
                        onBackStep = { viewModel.goStep(0) }
                    )
                }
                2 -> item {
                    PaymentStep(
                        methods = state.paymentMethods,
                        selected = state.selectedPayment,
                        note = state.note,
                        working = state.working,
                        cart = cart,
                        onSelect = viewModel::selectPayment,
                        onNote = viewModel::setNote,
                        onBackStep = { viewModel.goStep(1) },
                        onPlace = viewModel::placeOrder
                    )
                }
            }
        }
    }
}

@Composable
private fun StepIndicator(step: Int) {
    val titles = listOf(
        stringResource(R.string.step_address),
        stringResource(R.string.step_shipping),
        stringResource(R.string.step_payment)
    )
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        titles.forEachIndexed { i, title ->
            val active = i <= step
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "${(i + 1).toFaDigit()}",
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    title,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

private fun Int.toFaDigit(): String = when (this) {
    1 -> "۱"
    2 -> "۲"
    3 -> "۳"
    else -> toString()
}

@Composable
private fun AddressStep(
    address: CheckoutAddress,
    saved: List<SavedAddress>,
    selectedId: String?,
    formError: String?,
    working: Boolean,
    onAddress: (CheckoutAddress) -> Unit,
    onPick: (SavedAddress) -> Unit,
    onNext: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (saved.isNotEmpty()) {
            Text(stringResource(R.string.choose_address), style = MaterialTheme.typography.titleSmall)
            saved.forEach { s ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(
                            selected = s.id == selectedId,
                            onClick = { onPick(s) },
                            role = Role.RadioButton
                        ),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(selected = s.id == selectedId, onClick = null)
                    Column(Modifier.padding(vertical = 4.dp)) {
                        Text(s.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                        Text(
                            "${s.address.state}، ${s.address.city}، ${s.address.address1}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            Text("— یا آدرس جدید —", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = address.firstName, onValueChange = { onAddress(address.copy(firstName = it)) },
                label = { Text(stringResource(R.string.first_name)) }, modifier = Modifier.weight(1f), singleLine = true
            )
            OutlinedTextField(
                value = address.lastName, onValueChange = { onAddress(address.copy(lastName = it)) },
                label = { Text(stringResource(R.string.last_name)) }, modifier = Modifier.weight(1f), singleLine = true
            )
        }
        OutlinedTextField(
            value = address.phone, onValueChange = { onAddress(address.copy(phone = it.filter { c -> c.isDigit() }.take(11))) },
            label = { Text(stringResource(R.string.mobile)) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            modifier = Modifier.fillMaxWidth(), singleLine = true
        )
        OutlinedTextField(
            value = address.email, onValueChange = { onAddress(address.copy(email = it)) },
            label = { Text(stringResource(R.string.email_optional)) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(), singleLine = true
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = address.state, onValueChange = { onAddress(address.copy(state = it)) },
                label = { Text(stringResource(R.string.province)) }, modifier = Modifier.weight(1f), singleLine = true
            )
            OutlinedTextField(
                value = address.city, onValueChange = { onAddress(address.copy(city = it)) },
                label = { Text(stringResource(R.string.city)) }, modifier = Modifier.weight(1f), singleLine = true
            )
        }
        OutlinedTextField(
            value = address.address1, onValueChange = { onAddress(address.copy(address1 = it)) },
            label = { Text(stringResource(R.string.address)) },
            modifier = Modifier.fillMaxWidth(), minLines = 2
        )
        OutlinedTextField(
            value = address.postcode, onValueChange = { onAddress(address.copy(postcode = it.filter { c -> c.isDigit() }.take(10))) },
            label = { Text(stringResource(R.string.postcode)) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(), singleLine = true
        )
        if (formError == "fill") {
            Text(stringResource(R.string.fill_required), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        } else if (formError == "mobile") {
            Text(stringResource(R.string.invalid_mobile), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }
        Button(onClick = onNext, enabled = !working, modifier = Modifier.fillMaxWidth().height(50.dp)) {
            if (working) CircularProgressIndicator(modifier = androidx.compose.ui.Modifier.size(22.dp), strokeWidth = 2.dp)
            else Text(stringResource(R.string.continue_btn))
        }
    }
}

@Composable
private fun ShippingStep(
    cart: com.manoosh.app.domain.CartUi,
    working: Boolean,
    onSelect: (String, String) -> Unit,
    onNext: () -> Unit,
    onBackStep: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.shipping_method), style = MaterialTheme.typography.titleSmall)
        if (cart.shippingPackages.isEmpty() || cart.shippingPackages.all { it.options.isEmpty() }) {
            Text(
                "روش ارسالی برای این آدرس یافت نشد. آدرس را بررسی کنید.",
                style = MaterialTheme.typography.bodyMedium
            )
        }
        cart.shippingPackages.forEach { pkg ->
            pkg.options.forEach { opt ->
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (opt.selected) MaterialTheme.colorScheme.primaryContainer
                        else MaterialTheme.colorScheme.surface
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(enabled = !working) { onSelect(pkg.packageId, opt.rateId) }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            RadioButton(selected = opt.selected, onClick = null)
                            Column {
                                Text(opt.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                if (opt.description.isNotBlank()) {
                                    Text(opt.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                        Text(
                            formatMoney(opt.priceMinor, cart.minorUnit, cart.suffix.ifBlank { "تومان" }),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = onBackStep, modifier = Modifier.weight(1f)) { Text(stringResource(R.string.back)) }
            Button(onClick = onNext, enabled = !working, modifier = Modifier.weight(1f)) {
                if (working) CircularProgressIndicator(modifier = androidx.compose.ui.Modifier.size(22.dp), strokeWidth = 2.dp)
                else Text(stringResource(R.string.continue_btn))
            }
        }
    }
}

@Composable
private fun PaymentStep(
    methods: List<PaymentMethodUi>,
    selected: String,
    note: String,
    working: Boolean,
    cart: com.manoosh.app.domain.CartUi,
    onSelect: (String) -> Unit,
    onNote: (String) -> Unit,
    onBackStep: () -> Unit,
    onPlace: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.payment_method), style = MaterialTheme.typography.titleSmall)
        if (methods.isEmpty()) {
            Text("روش پرداختی یافت نشد.", style = MaterialTheme.typography.bodyMedium)
        }
        methods.forEach { m ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectable(selected = m.id == selected, onClick = { onSelect(m.id) }, role = Role.RadioButton),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(selected = m.id == selected, onClick = null)
                Column(Modifier.padding(vertical = 4.dp)) {
                    Text(m.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                    if (m.description.isNotBlank()) {
                        Text(m.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
        OutlinedTextField(
            value = note, onValueChange = onNote,
            label = { Text(stringResource(R.string.order_note)) },
            modifier = Modifier.fillMaxWidth(), minLines = 2
        )
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(stringResource(R.string.sum_items))
                    Text(formatMoney(cart.subtotalMinor, cart.minorUnit, cart.suffix))
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(stringResource(R.string.shipping_cost))
                    Text(formatMoney(cart.shippingMinor, cart.minorUnit, cart.suffix.ifBlank { "تومان" }))
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(stringResource(R.string.payable), fontWeight = FontWeight.Bold)
                    Text(
                        formatMoney(cart.totalMinor, cart.minorUnit, cart.suffix.ifBlank { "تومان" }),
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = onBackStep, modifier = Modifier.weight(1f)) { Text(stringResource(R.string.back)) }
            Button(onClick = onPlace, enabled = !working, modifier = Modifier.weight(2f).height(50.dp)) {
                if (working) CircularProgressIndicator(modifier = androidx.compose.ui.Modifier.size(22.dp), strokeWidth = 2.dp)
                else Text(stringResource(R.string.place_order))
            }
        }
    }
}

@Composable
fun OrderSuccessScreen(
    orderId: Long,
    onTrackOrder: () -> Unit,
    onHome: () -> Unit
) {
    Scaffold { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                Icons.Filled.CheckCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = androidx.compose.ui.Modifier.size(88.dp)
            )
            Spacer(Modifier.height(16.dp))
            Text(stringResource(R.string.order_success), style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(8.dp))
            Text(
                stringResource(R.string.order_number, orderId),
                style = MaterialTheme.typography.bodyLarge
            )
            Spacer(Modifier.height(24.dp))
            Button(onClick = onTrackOrder, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.track_order))
            }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(onClick = onHome, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.back_to_home))
            }
        }
    }
}
