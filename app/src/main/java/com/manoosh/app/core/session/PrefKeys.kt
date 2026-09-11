package com.manoosh.app.core.session

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey

internal object PrefKeys {
    val LOGGED_IN = booleanPreferencesKey("logged_in")
    val USER_ID = longPreferencesKey("user_id")
    val USER_NAME = stringPreferencesKey("user_name")
    val PHONE = stringPreferencesKey("phone")
    val CUSTOMER_ID = longPreferencesKey("customer_id")
    val WP_LOGIN = stringPreferencesKey("wp_login")

    val CART_KEY = stringPreferencesKey("cart_key")
    val CART_NONCE = stringPreferencesKey("cart_nonce")

    val THEME_MODE = intPreferencesKey("theme_mode")
    val RECENT_SEARCHES = stringPreferencesKey("recent_searches")
    val SAVED_ADDRESSES = stringPreferencesKey("saved_addresses")
    val AMAZING_DEADLINE = longPreferencesKey("amazing_deadline")
}
