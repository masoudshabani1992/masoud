package com.manoosh.app.core.common

/** Minimal Gregorian → Jalali converter for order dates, no extra dependency. */
object JalaliDate {
    private val months = arrayOf(
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    )

    /** Accepts ISO-8601 like "2026-08-30T12:34:56" and returns «۸ شهریور ۱۴۰۵». */
    fun fromIso(iso: String?): String {
        if (iso.isNullOrBlank()) return ""
        return try {
            val date = iso.substring(0, 10).split("-")
            val gy = date[0].toInt()
            val gm = date[1].toInt()
            val gd = date[2].toInt()
            val (jy, jm, jd) = gregorianToJalali(gy, gm, gd)
            "${jd.fa()} ${months[(jm - 1).coerceIn(0, 11)]} ${jy.fa()}"
        } catch (_: Exception) {
            iso.faDigits()
        }
    }

    private fun gregorianToJalali(gy: Int, gm: Int, gd: Int): Triple<Int, Int, Int> {
        val gdm = intArrayOf(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334)
        val gy2 = if (gm > 2) gy + 1 else gy
        var days = 355666 + 365 * gy + (gy2 + 3) / 4 - (gy2 + 99) / 100 + (gy2 + 399) / 400 + gd + gdm[gm - 1]
        var jy = -1595 + 33 * (days / 12053)
        days %= 12053
        jy += 4 * (days / 1461)
        days %= 1461
        if (days > 365) {
            jy += (days - 1) / 365
            days = (days - 1) % 365
        }
        val jm: Int
        val jd: Int
        if (days < 186) {
            jm = 1 + days / 31
            jd = 1 + days % 31
        } else {
            jm = 7 + (days - 186) / 30
            jd = 1 + (days - 186) % 30
        }
        return Triple(jy, jm, jd)
    }
}
