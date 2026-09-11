package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.ManooshApi
import com.manoosh.app.data.mapper.toDomain
import com.manoosh.app.domain.HomeConfigUi
import com.manoosh.app.domain.Product
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HomeRepository @Inject constructor(
    private val products: ProductRepository,
    private val manooshApi: ManooshApi
) {
    /** Home config from the plugin; falls back to a local default when unavailable. */
    suspend fun homeConfig(): ApiResult<HomeConfigUi> {
        val res = safeCall { manooshApi.home().toDomain() }
        return when (res) {
            is ApiResult.Success -> res
            is ApiResult.Error -> ApiResult.Success(
                HomeConfigUi(
                    banners = emptyList(),
                    featuredCategoryIds = emptyList(),
                    amazingTitle = "پیشنهاد شگفت‌انگیز",
                    amazingHours = 24
                )
            )
        }
    }

    suspend fun amazing(perPage: Int = 10): ApiResult<List<Product>> =
        products.products(
            BrowseOptions(onSaleOnly = true, sort = com.manoosh.app.domain.SortOption.POPULAR, perPage = perPage)
        )

    suspend fun newest(perPage: Int = 10): ApiResult<List<Product>> =
        products.products(
            BrowseOptions(sort = com.manoosh.app.domain.SortOption.NEWEST, perPage = perPage)
        )

    suspend fun bestSellers(perPage: Int = 10): ApiResult<List<Product>> =
        products.products(
            BrowseOptions(sort = com.manoosh.app.domain.SortOption.POPULAR, perPage = perPage)
        )

    suspend fun categoryRail(categoryId: Long, perPage: Int = 10): ApiResult<List<Product>> =
        products.products(BrowseOptions(categoryId = categoryId, perPage = perPage))
}
