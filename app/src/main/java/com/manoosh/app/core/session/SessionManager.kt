package com.manoosh.app.core.session

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

data class SessionState(
    val loggedIn: Boolean = false,
    val userId: Long = 0L,
    val userName: String = "",
    val phone: String = "",
    val customerId: Long = 0L
)

@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val prefs: DataStore<Preferences>
) {
    private val secretPrefs: SharedPreferences by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "manoosh_secret_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    val sessionFlow: Flow<SessionState> = prefs.data.map { p ->
        SessionState(
            loggedIn = p[PrefKeys.LOGGED_IN] == true,
            userId = p[PrefKeys.USER_ID] ?: 0L,
            userName = p[PrefKeys.USER_NAME].orEmpty(),
            phone = p[PrefKeys.PHONE].orEmpty(),
            customerId = p[PrefKeys.CUSTOMER_ID] ?: 0L
        )
    }

    suspend fun saveSession(
        userId: Long,
        userName: String,
        phone: String,
        customerId: Long,
        wpLogin: String,
        appPassword: String
    ) {
        secretPrefs.edit().putString("app_password", appPassword).apply()
        prefs.edit { e ->
            e[PrefKeys.LOGGED_IN] = true
            e[PrefKeys.USER_ID] = userId
            e[PrefKeys.USER_NAME] = userName
            e[PrefKeys.PHONE] = phone
            e[PrefKeys.CUSTOMER_ID] = customerId
            e[PrefKeys.WP_LOGIN] = wpLogin
        }
    }

    suspend fun updateProfile(userName: String, customerId: Long) {
        prefs.edit { e ->
            e[PrefKeys.USER_NAME] = userName
            e[PrefKeys.CUSTOMER_ID] = customerId
        }
    }

    suspend fun logout() {
        secretPrefs.edit().remove("app_password").apply()
        prefs.edit { e ->
            e[PrefKeys.LOGGED_IN] = false
            e[PrefKeys.USER_ID] = 0L
            e[PrefKeys.USER_NAME] = ""
            e[PrefKeys.PHONE] = ""
            e[PrefKeys.CUSTOMER_ID] = 0L
            e[PrefKeys.WP_LOGIN] = ""
        }
    }

    /** Basic-auth header for wp-json/wc/v3 calls (WordPress Application Password). */
    fun basicAuthHeader(): String? {
        val password = secretPrefs.getString("app_password", null) ?: return null
        // Read synchronously-cached login is overkill; DataStore read must be suspend,
        // so we also mirror the login in encrypted prefs at save time.
        val login = secretPrefs.getString("wp_login", null) ?: return null
        if (login.isBlank() || password.isBlank()) return null
        val token = Base64.encodeToString("$login:$password".toByteArray(), Base64.NO_WRAP)
        return "Basic $token"
    }

    suspend fun saveWpLogin(login: String) {
        secretPrefs.edit().putString("wp_login", login).apply()
    }
}
