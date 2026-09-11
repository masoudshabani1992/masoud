package com.manoosh.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.rememberNavController
import com.manoosh.app.core.ui.theme.ManooshTheme
import com.manoosh.app.feature.navigation.AppScaffold
import com.manoosh.app.feature.navigation.PendingDeepLink
import com.manoosh.app.feature.navigation.ThemeViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private var pendingDeepLink by mutableStateOf<PendingDeepLink?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        pendingDeepLink = extractDeepLink(intent)

        setContent {
            val themeVm: ThemeViewModel = hiltViewModel()
            val themeMode by themeVm.theme.collectAsStateWithLifecycle()

            ManooshTheme(themeMode = themeMode) {
                // The app is Persian-first: force RTL regardless of device locale.
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    val navController = rememberNavController()
                    AppScaffold(
                        navController = navController,
                        deepLink = pendingDeepLink,
                        onDeepLinkConsumed = { pendingDeepLink = null }
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        pendingDeepLink = extractDeepLink(intent)
    }

    private fun extractDeepLink(intent: Intent?): PendingDeepLink? {
        val uri = intent?.data ?: return null
        return when (uri.scheme?.lowercase()) {
            "https", "http" -> {
                // https://manooshorganic.com/product/<slug>/
                val segments = uri.pathSegments
                if (segments.firstOrNull() == "product" && segments.size >= 2) {
                    PendingDeepLink.ProductSlug(segments[1])
                } else null
            }
            "manoosh" -> {
                // manoosh://product/<id>  or  manoosh://product?slug=<slug>
                uri.getQueryParameter("slug")?.let { PendingDeepLink.ProductSlug(it) }
                    ?: uri.lastPathSegment?.toLongOrNull()?.let { PendingDeepLink.ProductId(it) }
            }
            else -> null
        }
    }
}
