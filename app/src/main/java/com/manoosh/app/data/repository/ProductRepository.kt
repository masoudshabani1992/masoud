package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Constants
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.ManooshApi
import com.manoosh.app.core.network.StoreApi
import com.manoosh.app.data.mapper.toDomain
import com.manoosh.app.domain.Product
import com.manoosh.app.domain.Review
import com.manoosh.app.domain.SortOption
import com.manoosh.app.domain.VariationUi
import javax.inject.Inject
import javax.inject.Singleton

data class BrowseOptions(
    val categoryId: Long? = null,
    val search: String? = null,
    val slug: String? = null,
    val sort: SortOption = SortOption.NEWEST,
    val onSaleOnly: Boolean = false,
    val inStockOnly: Boolean = false,
    val minPrice: Long? = null,
    val maxPrice: Long? = null,
    val page: Int = 1,
    val perPage: Int = Constants.PAGE_SIZE
)

@Singleton
class ProductRepository @Inject constructor(
    private val api: StoreApi,
    private val manooshApi: ManooshApi
) {
    suspend fun products(options: BrowseOptions): ApiResult<List<Product>> {
        val q = mutableMapOf(
            "per_page" to options.perPage.toString(),
            "page" to options.page.toString()
        )
        options.categoryId?.let { q["category"] = it.toString() }
        options.search?.takeIf { it.isNotBlank() }?.let { q["search"] = it }
        options.slug?.takeIf { it.isNotBlank() }?.let { q["slug"] = it }
        if (options.onSaleOnly) q["on_sale"] = "true"
        if (options.inStockOnly) q["stock_status"] = "instock"
        options.minPrice?.let { q["min_price"] = it.toString() }
        options.maxPrice?.let { q["max_price"] = it.toString() }
        when (options.sort) {
            SortOption.NEWEST -> { q["orderby"] = "date"; q["order"] = "desc" }
            SortOption.CHEAPEST -> { q["orderby"] = "price"; q["order"] = "asc" }
            SortOption.EXPENSIVE -> { q["orderby"] = "price"; q["order"] = "desc" }
            SortOption.POPULAR -> { q["orderby"] = "popularity"; q["order"] = "desc" }
            SortOption.RATING -> { q["orderby"] = "rating"; q["order"] = "desc" }
        }
        return safeCall { api.products(q).map { it.toDomain() } }
    }

    suspend fun product(id: Long): ApiResult<Product> =
        safeCall { api.product(id).toDomain() }

    /** Resolves a website product URL slug to a product (used by App Links). */
    suspend fun productBySlug(slug: String): ApiResult<Product?> {
        val bySlug = products(BrowseOptions(slug = slug, perPage = 1))
        if (bySlug is ApiResult.Success && bySlug.data.isNotEmpty()) {
            return ApiResult.Success(bySlug.data.first())
        }
        // Fallback: some servers ignore `slug`, try search instead.
        val cleaned = slug.replace("-", " ")
        val bySearch = products(BrowseOptions(search = cleaned, perPage = 5))
        return when (bySearch) {
            is ApiResult.Success -> {
                val match = bySearch.data.firstOrNull { it.slug == slug }
                    ?: bySearch.data.firstOrNull()
                ApiResult.Success(match)
            }
            is ApiResult.Error -> bySearch
        }
    }

    suspend fun reviews(productId: Long, page: Int = 1): ApiResult<List<Review>> =
        safeCall { api.reviews(productId, perPage = 20, page = page).map { it.toDomain() } }

    suspend fun related(categoryId: Long, excludeId: Long, limit: Int = 10): ApiResult<List<Product>> {
        val res = products(BrowseOptions(categoryId = categoryId, sort = SortOption.POPULAR, perPage = limit + 1))
        return res.map { list -> list.filter { it.id != excludeId }.take(limit) }
    }

    /**
     * Variable-product options via the companion plugin.
     * Returns an empty list when the plugin isn't installed (simple products work anyway).
     */
    suspend fun variations(productId: Long): ApiResult<List<VariationUi>> {
        return try {
            safeCall { manooshApi.variations(productId).map { it.toDomain() } }
        } catch (_: Exception) {
            ApiResult.Success(emptyList())
        }
    }
}
