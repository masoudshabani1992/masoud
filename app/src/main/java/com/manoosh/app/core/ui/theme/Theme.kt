package com.manoosh.app.core.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable

/** 0 = system, 1 = light, 2 = dark */
@Composable
fun ManooshTheme(
    themeMode: Int = 0,
    content: @Composable () -> Unit
) {
    val darkTheme = when (themeMode) {
        1 -> false
        2 -> true
        else -> isSystemInDarkTheme()
    }
    MaterialTheme(
        colorScheme = if (darkTheme) ManooshDarkColors else ManooshLightColors,
        typography = ManooshTypography,
        content = content
    )
}
