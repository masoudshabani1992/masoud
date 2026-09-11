package com.manoosh.app.feature.payment

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import com.manoosh.app.R
import com.manoosh.app.core.ui.components.ManooshTopBar
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class PaymentViewModel @Inject constructor(savedStateHandle: SavedStateHandle) : ViewModel() {
    val orderId: Long = savedStateHandle.get<Long>("orderId") ?: 0L
    val url: String = savedStateHandle.get<String>("url").orEmpty()
    val orderKey: String = savedStateHandle.get<String>("key").orEmpty()
}

/**
 * In-app payment: loads the gateway / order-pay page and watches for the
 * WooCommerce "order-received" (thank-you) URL to mark the order as paid.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PaymentWebViewScreen(
    onBack: () -> Unit,
    onSuccess: (Long) -> Unit,
    viewModel: PaymentViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    var webView by remember { mutableStateOf<WebView?>(null) }
    var loading by remember { mutableStateOf(true) }

    BackHandler(enabled = webView?.canGoBack() == true) {
        webView?.goBack()
    }

    Scaffold(
        topBar = {
            ManooshTopBar(
                title = context.getString(R.string.payment_redirect),
                onBack = onBack,
                actions = {
                    IconButton(onClick = { webView?.reload() }) {
                        Icon(Icons.Filled.Refresh, contentDescription = null)
                    }
                    IconButton(onClick = {
                        try {
                            context.startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(viewModel.url)))
                        } catch (_: Exception) {
                        }
                    }) {
                        Icon(Icons.Filled.OpenInBrowser, contentDescription = stringResource(R.string.open_in_browser))
                    }
                }
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            if (viewModel.url.isBlank()) {
                Text(
                    stringResource(R.string.payment_failed),
                    modifier = Modifier.padding(24.dp)
                )
            } else {
                AndroidView(
                    factory = { ctx ->
                        WebView(ctx).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.loadsImagesAutomatically = true
                            settings.useWideViewPort = true
                            settings.loadWithOverviewMode = true
                            CookieManager.getInstance().setAcceptCookie(true)
                            CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
                            webViewClient = object : WebViewClient() {
                                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                    loading = true
                                    url?.let { checkSuccess(it) }
                                }

                                override fun onPageFinished(view: WebView?, url: String?) {
                                    loading = false
                                    url?.let { checkSuccess(it) }
                                }

                                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                                    val target = request?.url?.toString().orEmpty()
                                    if (isSuccessUrl(target)) {
                                        onSuccess(viewModel.orderId)
                                        return true
                                    }
                                    // Keep payment inside the WebView (gateways redirect a lot).
                                    return false
                                }

                                private fun checkSuccess(currentUrl: String) {
                                    if (isSuccessUrl(currentUrl)) onSuccess(viewModel.orderId)
                                }

                                private fun isSuccessUrl(u: String): Boolean {
                                    val lower = u.lowercase()
                                    return lower.contains("order-received") ||
                                        lower.contains("order_received") ||
                                        (lower.contains("checkout") && lower.contains("success"))
                                }
                            }
                            loadUrl(viewModel.url)
                            webView = this
                        }
                    },
                    update = { webView = it },
                    modifier = Modifier.fillMaxSize()
                )
                if (loading) {
                    LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
}
