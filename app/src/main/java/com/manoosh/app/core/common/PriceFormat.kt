package com.manoosh.app.core.common

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.pow

private val faNumberFormat: NumberFormat by lazy { NumberFormat.getNumberInstance(Locale("fa", "IR")) }

private val faDigits = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')

/** Converts latin digits inside any string to Persian digits. */
fun String.faDigits(): String {
    val sb = StringBuilder(length)
    for (c in this) {
        if (c in '0'..'9') sb.append(faDigits[c - '0']) else sb.append(c)
    }
    return sb.toString()
}

fun Int.fa(): String = faNumberFormat.format(this)
fun Long.fa(): String = faNumberFormat.format(this)

/**
 * Formats a Store API amount (minor units as string, e.g. "543000") into
 * a Persian price like «۵۴۳٬۰۰۰ تومان».
 */
fun formatMoney(minorAmount: Long?, minorUnit: Int, suffix: String?): String {
    val divisor = 10.0.pow(minorUnit.coerceIn(0, 6)).toLong().coerceAtLeast(1L)
    val major = (minorAmount ?: 0L) / divisor
    val label = suffix?.takeIf { it.isNotBlank() } ?: Constants.DEFAULT_CURRENCY_SUFFIX
    return "${faNumberFormat.format(major)} $label"
}

fun String?.minorToLong(): Long? = this?.toDoubleOrNull()?.toLong()

/** Formats a wc/v3 amount (major units, e.g. "543000" or "543000.00"). */
fun formatMajorMoney(majorAmount: String?, suffix: String?): String {
    val major = majorAmount?.toDoubleOrNull()?.toLong() ?: 0L
    val label = suffix?.takeIf { it.isNotBlank() } ?: Constants.DEFAULT_CURRENCY_SUFFIX
    return "${faNumberFormat.format(major)} $label"
}

fun discountPercent(regularMinor: Long?, saleMinor: Long?): Int {
    if (regularMinor == null || regularMinor <= 0) return 0
    if (saleMinor == null || saleMinor <= 0 || saleMinor >= regularMinor) return 0
    return (((regularMinor - saleMinor) * 100) / regularMinor).toInt().coerceIn(1, 99)
}

/** mm:ss countdown in Persian digits. */
fun formatCountdown(totalSeconds: Long): String {
    val s = totalSeconds.coerceAtLeast(0)
    val h = s / 3600
    val m = (s % 3600) / 60
    val sec = s % 60
    return "%02d:%02d:%02d".format(h, m, sec).faDigits()
}
