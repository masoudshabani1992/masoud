package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.StoreApi
import com.manoosh.app.data.mapper.toDomain
import com.manoosh.app.domain.Category
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CategoryRepository @Inject constructor(
    private val api: StoreApi
) {
    private var cached: List<Category>? = null

    suspend fun categories(forceRefresh: Boolean = false): ApiResult<List<Category>> {
        cached?.let { if (!forceRefresh) return ApiResult.Success(it) }
        return safeCall { api.categories().map { it.toDomain() } }
            .also { if (it is ApiResult.Success) cached = it.data }
    }

    fun rootsOf(all: List<Category>): List<Category> = all.filter { it.parentId == 0L }

    fun childrenOf(all: List<Category>, parentId: Long): List<Category> =
        all.filter { it.parentId == parentId }
}
