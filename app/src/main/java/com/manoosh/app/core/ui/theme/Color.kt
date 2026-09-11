package com.manoosh.app.core.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

// Manoosh brand palette: organic greens + honey amber + Digikala-style offer red.
val ManooshGreen = Color(0xFF2F7D44)
val ManooshGreenDark = Color(0xFF1F5C30)
val ManooshGreenLight = Color(0xFFDCEDC8)
val ManooshOlive = Color(0xFF7C8A3A)
val ManooshHoney = Color(0xFFD99A2B)
val ManooshCream = Color(0xFFFAF7F0)
val OfferRed = Color(0xFFE03131)
val OfferRedDark = Color(0xFFFF6B6B)

val ManooshLightColors = lightColorScheme(
    primary = ManooshGreen,
    onPrimary = Color.White,
    primaryContainer = ManooshGreenLight,
    onPrimaryContainer = Color(0xFF0D3318),
    secondary = ManooshOlive,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE9EBC8),
    onSecondaryContainer = Color(0xFF2A2E05),
    tertiary = ManooshHoney,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE9C4),
    onTertiaryContainer = Color(0xFF3D2703),
    error = OfferRed,
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD4),
    onErrorContainer = Color(0xFF410002),
    background = ManooshCream,
    onBackground = Color(0xFF1A1C19),
    surface = Color.White,
    onSurface = Color(0xFF1A1C19),
    surfaceVariant = Color(0xFFF0EFE4),
    onSurfaceVariant = Color(0xFF44483F),
    outline = Color(0xFFD8D8CE),
    surfaceContainerHighest = Color(0xFFEDECE2)
)

val ManooshDarkColors = darkColorScheme(
    primary = Color(0xFF7CC98F),
    onPrimary = Color(0xFF073013),
    primaryContainer = Color(0xFF1F5C30),
    onPrimaryContainer = Color(0xFFDCEDC8),
    secondary = Color(0xFFB9C76E),
    onSecondary = Color(0xFF262A00),
    secondaryContainer = Color(0xFF3A4007),
    onSecondaryContainer = Color(0xFFE9EBC8),
    tertiary = Color(0xFFF0B95A),
    onTertiary = Color(0xFF3D2703),
    tertiaryContainer = Color(0xFF5C3F05),
    onTertiaryContainer = Color(0xFFFFE9C4),
    error = OfferRedDark,
    onError = Color(0xFF680003),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD4),
    background = Color(0xFF101511),
    onBackground = Color(0xFFE3E3D8),
    surface = Color(0xFF171D18),
    onSurface = Color(0xFFE3E3D8),
    surfaceVariant = Color(0xFF40463C),
    onSurfaceVariant = Color(0xFFC2C8B8),
    outline = Color(0xFF4A4F45)
)
