package com.manoosh.app.core.session

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

/**
 * Persists WooCommerce Store API cart identity headers ("Cart-Key" + "Nonce")
 * so the server-side cart survives app restarts.
 */
@Singleton
class CartSessionManager @Inject constructor(
    private val prefs: DataStore<Preferences>
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    @Volatile var cartKey: String? = null
        private set

    @Volatile var nonce: String? = null
        private set

    init {
        scope.launch {
            val pair = prefs.data.map { p -> (p[PrefKeys.CART_KEY] to p[PrefKeys.CART_NONCE]) }.first()
            cartKey = pair.first
            nonce = pair.second
        }
    }

    fun update(key: String?, newNonce: String?) {
        if (key != null) cartKey = key
        if (newNonce != null) nonce = newNonce
        scope.launch {
            prefs.edit { e ->
                if (key != null) e[PrefKeys.CART_KEY] = key
                if (newNonce != null) e[PrefKeys.CART_NONCE] = newNonce
            }
        }
    }

    suspend fun clear() {
        cartKey = null
        nonce = null
        prefs.edit { e ->
            e.remove(PrefKeys.CART_KEY)
            e.remove(PrefKeys.CART_NONCE)
        }
    }
}
