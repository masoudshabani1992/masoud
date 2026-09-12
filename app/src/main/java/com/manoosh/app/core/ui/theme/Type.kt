package com.manoosh.app.core.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.manoosh.app.R

/**
 * Manoosh brand typography — Yekan throughout the app.
 * (Only the regular cut is bundled, so it backs Normal/Medium/Bold.)
 */
val AppFontFamily: FontFamily = FontFamily(
    Font(R.font.yekan, FontWeight.Normal),
    Font(R.font.yekan, FontWeight.Medium),
    Font(R.font.yekan, FontWeight.Bold)
)

val ManooshTypography = Typography(
    displaySmall = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Bold, fontSize = 24.sp, lineHeight = 36.sp),
    headlineSmall = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Bold, fontSize = 20.sp, lineHeight = 30.sp),
    titleLarge = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 28.sp),
    titleMedium = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Bold, fontSize = 16.sp, lineHeight = 26.sp),
    titleSmall = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 24.sp),
    bodyLarge = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 28.sp),
    bodyMedium = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 26.sp),
    bodySmall = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 22.sp),
    labelLarge = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 22.sp),
    labelMedium = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 18.sp),
    labelSmall = TextStyle(fontFamily = AppFontFamily, fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 16.sp)
)
