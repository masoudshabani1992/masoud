package com.manoosh.app.feature.orders

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.JalaliDate
import com.manoosh.app.core.common.fa
import com.manoosh.app.core.common.formatMajorMoney
import com.manoosh.app.core.session.SessionManager
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.ErrorState
import com.manoosh.app.core.ui.components.LoadingBox
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.data.repository.OrderRepository
import com.manoosh.app.domain.Order
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ---------- Orders list ----------

data class OrdersUiState(
    val isLoading: Boolean = true,
    val isLoadingMore: Boolean = false,
    val needsLogin: Boolean = false,
    val error: String? = null,
    val orders: List<Order> = emptyList(),
    val hasMore: Boolean = false
)

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val orders: OrderRepository,
    private val session: SessionManager
) : ViewModel() {

    private val _state = MutableStateFlow(OrdersUiState())
    val state: StateFlow<OrdersUiState> = _state.asStateFlow()

    private var page = 1
    private var customerId = 0L

    init {
        load(reset = true)
    }

    fun load(reset: Boolean = false) {
        if (reset) {
            page = 1
            _state.update { it.copy(isLoading = true, error = null, orders = emptyList()) }
        } else {
            if (_state.value.isLoadingMore || !_state.value.hasMore) return
            _state.update { it.copy(isLoadingMore = true) }
        }
        viewModelScope.launch {
            customerId = try { session.sessionFlow.first().customerId } catch (_: Exception) { 0L }
            if (customerId <= 0) {
                // Fallback: guests see the login prompt.
                val loggedIn = try { session.sessionFlow.first().loggedIn } catch (_: Exception) { false }
                _state.update { it.copy(isLoading = false, isLoadingMore = false, needsLogin = !loggedIn, error = if (loggedIn) "noroot" else null) }
                return@launch
            }
            when (val res = orders.orders(customerId, page)) {
                is ApiResult.Success -> {
                    val list = if (reset) res.data else _state.value.orders + res.data
                    if (res.data.isNotEmpty()) page++
                    _state.update {
                        it.copy(
                            isLoading = false, isLoadingMore = false,
                            orders = list, hasMore = res.data.size >= 20
                        )
                    }
                }
                is ApiResult.Error -> _state.update {
                    it.copy(isLoading = false, isLoadingMore = false, error = res.message)
                }
            }
        }
    }
}

@Composable
fun OrdersScreen(
    onBack: () -> Unit,
    onOrderClick: (Long) -> Unit,
    onLoginClick: () -> Unit,
    viewModel: OrdersViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(topBar = { ManooshTopBar(title = stringResource(R.string.my_orders), onBack = onBack) }) { padding ->
        when {
            state.isLoading -> LoadingBox(Modifier.padding(padding))
            state.needsLogin -> EmptyState(
                title = stringResource(R.string.login_prompt),
                icon = Icons.Filled.ReceiptLong,
                actionLabel = stringResource(R.string.login_button),
                onAction = onLoginClick,
                modifier = Modifier.padding(padding)
            )
            state.error != null && state.orders.isEmpty() -> ErrorState(
                message = if (state.error == "noroot") "سفارشی یافت نشد" else state.error.orEmpty(),
                isNetwork = false,
                onRetry = { viewModel.load(reset = true) },
                modifier = Modifier.padding(padding)
            )
            state.orders.isEmpty() -> EmptyState(
                title = stringResource(R.string.no_orders),
                icon = Icons.Filled.ReceiptLong,
                modifier = Modifier.padding(padding)
            )
            else -> LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.orders, key = { it.id }) { order ->
                    OrderRow(order = order, onClick = { onOrderClick(order.id) })
                }
                if (state.hasMore) {
                    item {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                            if (state.isLoadingMore) CircularProgressIndicator(Modifier.size(28.dp))
                        }
                        LaunchedEffect(state.orders.size) { viewModel.load(reset = false) }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderRow(order: Order, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(
                    stringResource(R.string.order_number, order.id),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                OrderStatusChip(order.status)
            }
            Spacer(Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    "${stringResource(R.string.order_date)}: ${JalaliDate.fromIso(order.dateIso)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    formatMajorMoney(order.totalMajor, "تومان"),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            if (order.items.isNotEmpty()) {
                Text(
                    order.items.take(3).joinToString("، ") { "${it.name} (${it.quantity.fa()})" },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
            }
        }
    }
}

@Composable
fun OrderStatusChip(status: String) {
    val (labelRes, color) = when (status) {
        "pending" -> R.string.order_status_pending to MaterialTheme.colorScheme.tertiary
        "processing" -> R.string.order_status_processing to MaterialTheme.colorScheme.primary
        "on-hold" -> R.string.order_status_on_hold to MaterialTheme.colorScheme.tertiary
        "completed" -> R.string.order_status_completed to MaterialTheme.colorScheme.primary
        "cancelled" -> R.string.order_status_cancelled to MaterialTheme.colorScheme.error
        "refunded" -> R.string.order_status_refunded to MaterialTheme.colorScheme.secondary
        "failed" -> R.string.order_status_failed to MaterialTheme.colorScheme.error
        else -> R.string.order_status_other to MaterialTheme.colorScheme.onSurfaceVariant
    }
    Surface(color = color.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp)) {
        Text(
            stringResource(labelRes),
            style = MaterialTheme.typography.labelMedium,
            color = color,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}

// ---------- Order detail ----------

data class OrderDetailUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val order: Order? = null,
    val paying: Boolean = false
)

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val orders: OrderRepository
) : ViewModel() {
    private val orderId: Long = savedStateHandle.get<Long>("id") ?: 0L

    private val _state = MutableStateFlow(OrderDetailUiState())
    val state: StateFlow<OrderDetailUiState> = _state.asStateFlow()

    private val _pay = MutableSharedFlow<Triple<Long, String, String>>(extraBufferCapacity = 1)
    val pay: SharedFlow<Triple<Long, String, String>> = _pay.asSharedFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            when (val res = orders.order(orderId)) {
                is ApiResult.Success -> _state.update { it.copy(isLoading = false, order = res.data) }
                is ApiResult.Error -> _state.update { it.copy(isLoading = false, error = res.message) }
            }
        }
    }

    fun pay() {
        val order = _state.value.order ?: return
        viewModelScope.launch {
            _state.update { it.copy(paying = true) }
            when (val res = orders.payUrl(order.id)) {
                is ApiResult.Success -> {
                    _state.update { it.copy(paying = false) }
                    _pay.tryEmit(Triple(order.id, res.data, ""))
                }
                is ApiResult.Error -> {
                    _state.update { it.copy(paying = false) }
                    _messages.tryEmit(res.message)
                }
            }
        }
    }
}

@Composable
fun OrderDetailScreen(
    orderId: Long,
    onBack: () -> Unit,
    onPay: (orderId: Long, url: String, key: String) -> Unit,
    viewModel: OrderDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.pay.collect { (id, url, key) -> onPay(id, url, key) }
    }
    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.order_number, orderId), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        when {
            state.isLoading -> LoadingBox(Modifier.padding(padding))
            state.error != null -> ErrorState(
                message = state.error.orEmpty(), isNetwork = false,
                onRetry = viewModel::load, modifier = Modifier.padding(padding)
            )
            state.order != null -> {
                val order = state.order!!
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            OrderStatusChip(order.status)
                            Text(JalaliDate.fromIso(order.dateIso), style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                    item {
                        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(stringResource(R.string.order_items), style = MaterialTheme.typography.titleSmall)
                                order.items.forEach { item ->
                                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("${item.name} × ${item.quantity.fa()}", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                        Text(formatMajorMoney(item.totalMajor, "تومان"), style = MaterialTheme.typography.bodyMedium)
                                    }
                                }
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(stringResource(R.string.order_total), fontWeight = FontWeight.Bold)
                                    Text(formatMajorMoney(order.totalMajor, "تومان"), fontWeight = FontWeight.Bold)
                                }
                                if (order.paymentTitle.isNotBlank()) {
                                    Text("پرداخت: ${order.paymentTitle}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                    order.shipping?.let { addr ->
                        item {
                            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                                Column(Modifier.padding(12.dp)) {
                                    Text("آدرس تحویل", style = MaterialTheme.typography.titleSmall)
                                    Text(
                                        "${addr.firstName} ${addr.lastName} — ${addr.state}، ${addr.city}، ${addr.address1}",
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    if (addr.phone.isNotBlank()) Text(addr.phone, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                    if (order.status == "pending" || order.status == "failed") {
                        item {
                            Button(
                                onClick = viewModel::pay,
                                enabled = !state.paying,
                                modifier = Modifier.fillMaxWidth().height(50.dp)
                            ) {
                                if (state.paying) CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
                                else Text(stringResource(R.string.pay_order))
                            }
                        }
                    }
                }
            }
        }
    }
}
