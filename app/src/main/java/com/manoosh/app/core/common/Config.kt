package com.manoosh.app.core.common

import com.manoosh.app.BuildConfig

/** App-wide configuration from BuildConfig (see local.properties / CI env). */
object Config {
    val baseUrl: String = BuildConfig.BASE_URL.trimEnd('/')
    fun apiBase(): String = "$baseUrl/wp-json/"

    val wcConsumerKey: String = BuildConfig.WC_CONSUMER_KEY
    val wcConsumerSecret: String = BuildConfig.WC_CONSUMER_SECRET
    fun hasWcKeys(): Boolean = wcConsumerKey.isNotBlank() && wcConsumerSecret.isNotBlank()

    /** Fallback order-pay URL used when a gateway doesn't return a redirect URL. */
    fun orderPayUrl(orderId: Long, orderKey: String): String =
        "$baseUrl/checkout/order-pay/$orderId/?key=$orderKey"

    fun productShareText(name: String, permalink: String): String = "$name\n$permalink"
}
