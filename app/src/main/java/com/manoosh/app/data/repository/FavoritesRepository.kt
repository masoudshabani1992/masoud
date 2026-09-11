package com.manoosh.app.data.repository

import com.manoosh.app.data.local.FavoriteDao
import com.manoosh.app.data.local.FavoriteEntity
import com.manoosh.app.domain.FavoriteItem
import com.manoosh.app.domain.Product
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

@Singleton
class FavoritesRepository @Inject constructor(
    private val dao: FavoriteDao
) {
    val favorites: Flow<List<FavoriteItem>> = dao.observeAll().map { list ->
        list.map {
            FavoriteItem(
                id = it.id, name = it.name, imageUrl = it.imageUrl,
                priceMinor = it.priceMinor, regularMinor = it.regularMinor,
                minorUnit = it.minorUnit, suffix = it.suffix, permalink = it.permalink
            )
        }
    }

    fun isFavorite(id: Long): Flow<Boolean> = dao.observeExists(id)

    /** Toggles and returns the new state (true = now favorite). */
    suspend fun toggle(product: Product): Boolean {
        val current = try {
            dao.observeExists(product.id).first()
        } catch (_: Exception) {
            false
        }
        return if (current) {
            dao.delete(product.id)
            false
        } else {
            dao.upsert(
                FavoriteEntity(
                    id = product.id,
                    name = product.name,
                    imageUrl = product.mainImage,
                    priceMinor = product.priceMinor,
                    regularMinor = product.regularMinor,
                    minorUnit = product.minorUnit,
                    suffix = product.currencySuffix,
                    permalink = product.permalink
                )
            )
            true
        }
    }

    suspend fun remove(id: Long) = dao.delete(id)
}
