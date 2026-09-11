package com.manoosh.app.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.manoosh.app.R
import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Constants
import com.manoosh.app.core.common.faDigits
import com.manoosh.app.core.ui.components.ManooshTopBar
import com.manoosh.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ---------- Phone ----------

data class PhoneUiState(
    val phone: String = "",
    val loading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class AuthPhoneViewModel @Inject constructor(
    private val auth: AuthRepository
) : ViewModel() {
    private val _state = MutableStateFlow(PhoneUiState())
    val state: StateFlow<PhoneUiState> = _state.asStateFlow()

    private val _codeSent = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val codeSent: SharedFlow<String> = _codeSent.asSharedFlow()

    fun onPhoneChange(phone: String) {
        _state.update { it.copy(phone = phone.filter { c -> c.isDigit() }.take(11), error = null) }
    }

    fun sendCode() {
        val phone = Constants.normalizePhone(_state.value.phone)
        if (!Constants.isValidIranMobile(phone)) {
            _state.update { it.copy(error = "mobile") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            when (val res = auth.requestOtp(phone)) {
                is ApiResult.Success -> {
                    _state.update { it.copy(loading = false) }
                    if (res.data.success) {
                        _codeSent.tryEmit(phone)
                    } else {
                        _state.update { it.copy(error = res.data.message ?: "server") }
                    }
                }
                is ApiResult.Error -> {
                    _state.update { it.copy(loading = false, error = friendly(res)) }
                }
            }
        }
    }

    private fun friendly(res: ApiResult.Error): String {
        if (res.isNetwork) return "network"
        if (res.code == 404) return "plugin_missing"
        return res.message.ifBlank { "server" }
    }
}

@Composable
fun AuthPhoneScreen(
    onBack: () -> Unit,
    onCodeSent: (String) -> Unit,
    viewModel: AuthPhoneViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.codeSent.collect { onCodeSent(it) }
    }

    Scaffold(topBar = { ManooshTopBar(title = stringResource(R.string.login_title), onBack = onBack) }) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))
            Text(stringResource(R.string.login_title), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                stringResource(R.string.login_hint),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(24.dp))
            OutlinedTextField(
                value = state.phone,
                onValueChange = viewModel::onPhoneChange,
                label = { Text(stringResource(R.string.mobile)) },
                placeholder = { Text("09123456789") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true,
                isError = state.error != null,
                modifier = Modifier.fillMaxWidth()
            )
            state.error?.let { err ->
                Spacer(Modifier.height(8.dp))
                Text(
                    text = when (err) {
                        "mobile" -> stringResource(R.string.invalid_mobile)
                        "network" -> stringResource(R.string.error_network)
                        "plugin_missing" -> "سرویس ورود پیامکی روی سایت فعال نیست. لطفاً با پشتیبانی در میان بگذارید."
                        "server" -> stringResource(R.string.error_server)
                        else -> err
                    },
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = viewModel::sendCode,
                enabled = !state.loading,
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                if (state.loading) CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
                else Text(stringResource(R.string.send_code))
            }
        }
    }
}

// ---------- OTP ----------

data class OtpUiState(
    val code: String = "",
    val loading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class AuthOtpViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val auth: AuthRepository
) : ViewModel() {
    val phone: String = savedStateHandle.get<String>("phone").orEmpty()

    private val _state = MutableStateFlow(OtpUiState())
    val state: StateFlow<OtpUiState> = _state.asStateFlow()

    private val _verified = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val verified: SharedFlow<Unit> = _verified.asSharedFlow()

    fun onCodeChange(code: String) {
        val filtered = code.filter { it.isDigit() }.take(5)
        _state.update { it.copy(code = filtered, error = null) }
        if (filtered.length == 5) verify()
    }

    fun verify() {
        val code = _state.value.code
        if (code.length != 5 || _state.value.loading) return
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            when (val res = auth.verifyOtp(phone, code)) {
                is ApiResult.Success -> {
                    _state.update { it.copy(loading = false) }
                    _verified.tryEmit(Unit)
                }
                is ApiResult.Error -> {
                    _state.update {
                        it.copy(
                            loading = false,
                            error = if (res.isNetwork) "network" else res.message.ifBlank { "server" }
                        )
                    }
                }
            }
        }
    }

    fun resend(onSent: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            val res = auth.requestOtp(phone)
            _state.update { it.copy(loading = false) }
            if (res is ApiResult.Success && res.data.success) {
                _state.update { it.copy(code = "") }
                onSent()
            } else {
                _state.update { it.copy(error = (res as? ApiResult.Error)?.message ?: "server") }
            }
        }
    }
}

@Composable
fun AuthOtpScreen(
    phone: String,
    onBack: () -> Unit,
    onVerified: () -> Unit,
    viewModel: AuthOtpViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var secondsLeft by remember { mutableIntStateOf(120) }

    LaunchedEffect(Unit) {
        viewModel.verified.collect {
            snackbar.showSnackbar("خوش آمدید!")
            onVerified()
        }
    }
    LaunchedEffect(secondsLeft) {
        if (secondsLeft > 0) {
            delay(1000)
            secondsLeft--
        }
    }

    Scaffold(
        topBar = { ManooshTopBar(title = stringResource(R.string.otp_title), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))
            Text(stringResource(R.string.otp_title), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                stringResource(R.string.otp_hint, phone.faDigits()),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            TextButton(onClick = onBack) { Text(stringResource(R.string.edit_mobile)) }
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(
                value = state.code,
                onValueChange = viewModel::onCodeChange,
                label = { Text("کد تایید") },
                placeholder = { Text("—————".faDigits()) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                singleLine = true,
                isError = state.error != null,
                textStyle = MaterialTheme.typography.headlineMedium.copy(textAlign = TextAlign.Center),
                modifier = Modifier.fillMaxWidth()
            )
            state.error?.let { err ->
                Spacer(Modifier.height(8.dp))
                Text(
                    text = when (err) {
                        "network" -> stringResource(R.string.error_network)
                        "server" -> stringResource(R.string.error_server)
                        else -> err
                    },
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = viewModel::verify,
                enabled = !state.loading && state.code.length == 5,
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                if (state.loading) CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
                else Text(stringResource(R.string.verify))
            }
            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center, modifier = Modifier.fillMaxWidth()) {
                if (secondsLeft > 0) {
                    val mm = "%02d:%02d".format(secondsLeft / 60, secondsLeft % 60).faDigits()
                    Text(stringResource(R.string.resend_in, mm), style = MaterialTheme.typography.bodyMedium)
                } else {
                    TextButton(onClick = { viewModel.resend { secondsLeft = 120 } }) {
                        Text(stringResource(R.string.resend_code))
                    }
                }
            }
        }
    }
}
