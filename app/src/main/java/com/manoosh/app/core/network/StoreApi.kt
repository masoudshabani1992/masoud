package com.manoosh.app.core.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.QueryMap

/** WooCommerce Store API (public, no keys needed for catalog/cart/checkout). */
interface StoreApi {

    @GET("wc/store/v1/products")
    suspend fun products(@QueryMap options: Map<String, String>): List<ProductDto>

    @GET("wc/store/v1/products/{id}")
    suspend fun product(@Path("id") id: Long): ProductDto

    @GET("wc/store/v1/products/categories")
    suspend fun categories(
        @Query("per_page") perPage: Int = 100,
        @Query("hide_empty") hideEmpty: Boolean = true
    ): List<CategoryDto>

    @GET("wc/store/v1/products/reviews")
    suspend fun reviews(
        @Query("product_id") productId: Long,
        @Query("per_page") perPage: Int = 20,
        @Query("page") page: Int = 1
    ): List<ReviewDto>

    // ---- Cart ----

    @GET("wc/store/v1/cart")
    suspend fun cart(): CartDto

    @POST("wc/store/v1/cart/add-item")
    suspend fun addItem(@Body body: AddItemBody): CartDto

    @POST("wc/store/v1/cart/update-item")
    suspend fun updateItem(@Body body: UpdateItemBody): CartDto

    @POST("wc/store/v1/cart/remove-item")
    suspend fun removeItem(@Body body: RemoveItemBody): CartDto

    @POST("wc/store/v1/cart/apply-coupon")
    suspend fun applyCoupon(@Body body: CouponBody): CartDto

    @POST("wc/store/v1/cart/remove-coupon")
    suspend fun removeCoupon(@Body body: CouponBody): CartDto

    @PUT("wc/store/v1/cart/select-shipping-rate/{package_id}")
    suspend fun selectShipping(
        @Path("package_id") packageId: String,
        @Body body: SelectShippingBody
    ): CartDto

    @POST("wc/store/v1/cart/update-customer")
    suspend fun updateCustomer(@Body body: UpdateCustomerBody): CartDto

    // ---- Checkout ----

    @GET("wc/store/v1/checkout")
    suspend fun checkoutData(): CheckoutDataDto

    @POST("wc/store/v1/checkout")
    suspend fun checkout(@Body body: CheckoutBody): CheckoutResponseDto
}
