package com.manoosh.app.feature.web

import android.annotation.SuppressLint
import android.content.Intent
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
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
class WebViewModel @Inject constructor(savedStateHandle: SavedStateHandle) : ViewModel() {
    val title: String = savedStateHandle.get<String>("title").orEmpty()
    val url: String = savedStateHandle.get<String>("url").orEmpty()
}

/** Generic in-app browser (magazine, support pages, external banners). */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebScreen(
    onBack: () -> Unit,
    viewModel: WebViewModel = hiltViewModel()
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
                title = viewModel.title,
                onBack = onBack,
                actions = {
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
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                loading = false
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
