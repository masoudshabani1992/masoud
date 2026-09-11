package com.manoosh.app.core.session

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

@Singleton
class UserPrefs @Inject constructor(
    private val prefs: DataStore<Preferences>
) {
    /** 0 = system, 1 = light, 2 = dark */
    val themeFlow: Flow<Int> = prefs.data.map { it[PrefKeys.THEME_MODE] ?: 0 }

    suspend fun setTheme(mode: Int) {
        prefs.edit { it[PrefKeys.THEME_MODE] = mode.coerceIn(0, 2) }
    }

    val recentSearches: Flow<List<String>> = prefs.data.map { p ->
        p[PrefKeys.RECENT_SEARCHES]
            ?.split('␟')
            ?.map { it.trim() }
            ?.filter { it.isNotEmpty() }
            ?.take(10)
            .orEmpty()
    }

    suspend fun addRecentSearch(query: String) {
        val q = query.trim()
        if (q.length < 2) return
        prefs.edit { e ->
            val current = e[PrefKeys.RECENT_SEARCHES]?.split('␟').orEmpty()
                .map { it.trim() }.filter { it.isNotEmpty() && !it.equals(q, ignoreCase = true) }
            e[PrefKeys.RECENT_SEARCHES] = (listOf(q) + current).take(10).joinToString("␟")
        }
    }

    suspend fun clearRecentSearches() {
        prefs.edit { it.remove(PrefKeys.RECENT_SEARCHES) }
    }

    /** Client-side countdown anchor for the Amazing section (synced daily). */
    val amazingDeadline: Flow<Long> = prefs.data.map { it[PrefKeys.AMAZING_DEADLINE] ?: 0L }

    suspend fun setAmazingDeadline(epochMillis: Long) {
        prefs.edit { it[PrefKeys.AMAZING_DEADLINE] = epochMillis }
    }
}
