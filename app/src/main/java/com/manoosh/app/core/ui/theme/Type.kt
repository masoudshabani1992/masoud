package com.manoosh.app.core.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Persian-ready typography.
 *
 * NOTE: to use Vazirmatn instead of the system font, drop the TTF files into
 * `res/font/` (e.g. vazirmatn_regular.ttf) and replace [AppFontFamily] with:
 *
 *   FontFamily(Font(R.font.vazirmatn_regular, FontWeight.Normal), ...)
 */
val AppFontFamily: FontFamily = FontFamily.Default

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
