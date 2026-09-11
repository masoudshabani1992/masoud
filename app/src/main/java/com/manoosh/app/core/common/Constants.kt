package com.manoosh.app.core.common

/** Adjust these links/texts to match the site. */
object Constants {
    const val MAGAZINE_PATH = "/mag/"
    const val SHOP_PATH = "/shop/"
    const val MY_ACCOUNT_PATH = "/my-account/"
    const val CONTACT_PATH = "/contact-us/"

    const val SUPPORT_PHONE_DISPLAY = "09370448294"
    const val SUPPORT_PHONE_TEL = "tel:+989370448294"
    const val PHONE_DISPLAY = "02177917541"
    const val SUPPORT_HOURS = "ساعت پاسخگویی: ۱۰ تا ۲۲"

    const val COUNTRY_IR = "IR"
    const val DEFAULT_CURRENCY_SUFFIX = "تومان"

    const val PAGE_SIZE = 20
    const val AMAZING_DEFAULT_HOURS = 24

    /** Iranian mobile validation: 09xxxxxxxxx */
    fun isValidIranMobile(phone: String): Boolean =
        phone.trim().matches(Regex("^09\\d{9}$"))

    fun normalizePhone(phone: String): String =
        phone.trim().replace("[\\s-]".toRegex(), "")
            .replace('۰', '0').replace('۱', '1').replace('۲', '2')
            .replace('۳', '3').replace('۴', '4').replace('۵', '5')
            .replace('۶', '6').replace('۷', '7').replace('۸', '8').replace('۹', '9')
}
