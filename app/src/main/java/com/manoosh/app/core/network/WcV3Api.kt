package com.manoosh.app.core.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * WooCommerce REST API v3 for logged-in users.
 * Authenticated with the WordPress Application Password issued at OTP login
 * (see AuthInterceptor), so no embedded Consumer Key is required.
 */
interface WcV3Api {

    @GET("wc/v3/orders")
    suspend fun orders(
        @Query("customer") customerId: Long,
        @Query("per_page") perPage: Int = 20,
        @Query("page") page: Int = 1
    ): List<OrderDto>

    @GET("wc/v3/orders/{id}")
    suspend fun order(@Path("id") id: Long): OrderDto

    @GET("wc/v3/customers/{id}")
    suspend fun customer(@Path("id") id: Long): CustomerDto

    @PUT("wc/v3/customers/{id}")
    suspend fun updateCustomer(
        @Path("id") id: Long,
        @Body body: CustomerUpdateBody
    ): CustomerDto
}
