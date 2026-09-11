package com.manoosh.app.feature.cart

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.formatMoney
import com.manoosh.app.core.session.SessionManager
import com.manoosh.app.core.session.SessionState
import com.manoosh.app.core.ui.components.EmptyState
import com.manoosh.app.core.ui.components.LoadingBox
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.core.ui.components.PriceText
import com.manoosh.app.core.ui.components.QuantityStepper
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.domain.CartItemUi
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

@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    sessionManager: SessionManager
) : ViewModel() {

    val cart = cartRepository.cart

    val session: StateFlow<SessionState> = sessionManager.sessionFlow.stateIn(
        scope = viewModelScope, started = SharingStarted.Eagerly, initialValue = SessionState()
    )

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _loading.update { true }
            val res = cartRepository.refresh()
            _loading.update { false }
            if (res is ApiResult.Error && cartRepository.cart.value.isEmpty) {
                _messages.tryEmit(res.message)
            }
        }
    }

    fun setQuantity(item: CartItemUi, qty: Int) {
        viewModelScope.launch {
            val res = cartRepository.setQuantity(item.key, qty)
            if (res is ApiResult.Error) _messages.tryEmit(res.message)
        }
    }

    fun remove(item: CartItemUi) {
        viewModelScope.launch {
            val res = cartRepository.remove(item.key)
            if (res is ApiResult.Error) _messages.tryEmit(res.message)
        }
    }

    fun applyCoupon(code: String) {
        if (code.isBlank()) return
        viewModelScope.launch {
            val res = cartRepository.applyCoupon(code)
            if (res is ApiResult.Error) _messages.tryEmit(res.message)
        }
    }

    fun removeCoupon(code: String) {
        viewModelScope.launch {
            val res = cartRepository.removeCoupon(code)
            if (res is ApiResult.Error) _messages.tryEmit(res.message)
        }
    }
}

@Composable
fun CartScreen(
    onProductClick: (Long) -> Unit,
    onCheckout: () -> Unit,
    onBrowse: () -> Unit,
    onLoginClick: () -> Unit,
    viewModel: CartViewModel = hiltViewModel()
) {
    val cart by viewModel.cart.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val session by viewModel.session.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var coupon by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.cart_title)) },
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            if (!cart.isEmpty) {
                Surface(shadowElevation = 8.dp) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        PriceText(
                            minor = cart.totalMinor,
                            regularMinor = null,
                            minorUnit = cart.minorUnit,
                            suffix = cart.suffix.ifBlank { stringResource(R.string.toman) },
                            large = true,
                            modifier = Modifier.weight(1f)
                        )
                        Button(onClick = onCheckout, modifier = Modifier.height(48.dp)) {
                            Text(stringResource(R.string.continue_checkout))
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (loading && cart.isEmpty) {
            LoadingBox(Modifier.padding(padding))
            return@Scaffold
        }
        if (cart.isEmpty) {
            EmptyState(
                title = stringResource(R.string.cart_empty),
                hint = stringResource(R.string.cart_empty_hint),
                icon = Icons.Filled.ShoppingCart,
                actionLabel = stringResource(R.string.go_to_shop),
                onAction = onBrowse,
                modifier = Modifier.padding(padding)
            )
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (!session.loggedIn) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.primaryContainer)
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            stringResource(R.string.login_prompt),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(onClick = onLoginClick) { Text(stringResource(R.string.login_button)) }
                    }
                }
            }
            items(cart.items, key = { it.key }) { item ->
                CartItemCard(
                    item = item,
                    onClick = { onProductClick(item.productId) },
                    onQuantity = { viewModel.setQuantity(item, it) },
                    onRemove = { viewModel.remove(item) }
                )
            }
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                    Column(Modifier.padding(12.dp)) {
                        Text(stringResource(R.string.coupon_code), style = MaterialTheme.typography.titleSmall)
                        Spacer(Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = coupon,
                                onValueChange = { coupon = it },
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                            Button(onClick = {
                                viewModel.applyCoupon(coupon)
                                coupon = ""
                            }) { Text(stringResource(R.string.apply_coupon)) }
                        }
                        cart.coupons.forEach { code ->
                            Spacer(Modifier.height(8.dp))
                            AssistChip(
                                onClick = { viewModel.removeCoupon(code) },
                                label = { Text("$code ✕") }
                            )
                        }
                    }
                }
            }
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                    Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        SummaryRow(stringResource(R.string.sum_items), formatMoney(cart.subtotalMinor, cart.minorUnit, cart.suffix))
                        if ((cart.discountMinor ?: 0) > 0) {
                            SummaryRow(
                                stringResource(R.string.discount),
                                formatMoney(cart.discountMinor, cart.minorUnit, cart.suffix),
                                highlight = true
                            )
                        }
                        SummaryRow(
                            stringResource(R.string.shipping_cost),
                            if ((cart.shippingMinor ?: 0) > 0) formatMoney(cart.shippingMinor, cart.minorUnit, cart.suffix)
                            else stringResource(R.string.shipping_at_checkout)
                        )
                        SummaryRow(
                            stringResource(R.string.payable),
                            formatMoney(cart.totalMinor, cart.minorUnit, cart.suffix.ifBlank { "تومان" }),
                            bold = true
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItemUi,
    onClick: () -> Unit,
    onQuantity: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.clickable { onClick() }
    ) {
        Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(84.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            )
            Column(Modifier.weight(1f)) {
                Text(item.name, style = MaterialTheme.typography.bodyMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                if (item.variationText.isNotBlank()) {
                    Text(item.variationText, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    if (item.soldIndividually) {
                        Spacer(Modifier.width(8.dp))
                    } else {
                        QuantityStepper(quantity = item.quantity, maxQty = item.maxQty, onChange = onQuantity)
                    }
                    PriceText(
                        minor = item.totalMinor,
                        regularMinor = null,
                        minorUnit = item.minorUnit,
                        suffix = item.suffix
                    )
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    IconButton(onClick = onRemove, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Filled.DeleteOutline, contentDescription = stringResource(R.string.remove), tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
private fun SummaryRow(label: String, value: String, bold: Boolean = false, highlight: Boolean = false) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(
            label,
            style = if (bold) MaterialTheme.typography.titleSmall else MaterialTheme.typography.bodyMedium,
            fontWeight = if (bold) FontWeight.Bold else null,
            color = if (highlight) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
        )
        Text(
            value,
            style = if (bold) MaterialTheme.typography.titleSmall else MaterialTheme.typography.bodyMedium,
            fontWeight = if (bold) FontWeight.Bold else null,
            color = if (highlight) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
        )
    }
}
