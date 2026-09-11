package com.manoosh.app.core.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Endpoints served by the Manoosh companion WordPress plugin. */
interface ManooshApi {

    @POST("manoosh/v1/otp/request")
    suspend fun otpRequest(@Body body: OtpRequestBody): OtpResponse

    @POST("manoosh/v1/otp/verify")
    suspend fun otpVerify(@Body body: OtpVerifyBody): OtpVerifyResponse

    @GET("manoosh/v1/home")
    suspend fun home(): HomeConfigDto

    @GET("manoosh/v1/variations")
    suspend fun variations(@Query("product_id") productId: Long): List<VariationDto>

    @GET("manoosh/v1/orders/{id}/pay-url")
    suspend fun orderPayUrl(@Path("id") id: Long): PayUrlResponse
}
