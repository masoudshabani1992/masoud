package com.manoosh.app.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.manoosh.app.core.session.PrefKeys
import com.manoosh.app.domain.SavedAddress
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

@Singleton
class AddressesRepository @Inject constructor(
    private val prefs: DataStore<Preferences>,
    private val gson: Gson
) {
    private val listType = object : TypeToken<List<SavedAddress>>() {}.type

    val addresses: Flow<List<SavedAddress>> = prefs.data.map { p ->
        val json = p[PrefKeys.SAVED_ADDRESSES] ?: return@map emptyList()
        try {
            gson.fromJson<List<SavedAddress>>(json, listType) ?: emptyList()
        } catch (_: Exception) {
            emptyList()
        }
    }

    suspend fun save(address: SavedAddress): SavedAddress {
        val withId = if (address.id.isBlank()) address.copy(id = UUID.randomUUID().toString()) else address
        val current = addresses.first().toMutableList()
        val idx = current.indexOfFirst { it.id == withId.id }
        if (idx >= 0) current[idx] = withId else current.add(0, withId)
        persist(current)
        return withId
    }

    suspend fun delete(id: String) {
        val current = addresses.first().filterNot { it.id == id }
        persist(current)
    }

    private suspend fun persist(list: List<SavedAddress>) {
        prefs.edit { it[PrefKeys.SAVED_ADDRESSES] = gson.toJson(list) }
    }
}
