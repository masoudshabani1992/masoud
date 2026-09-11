package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Config
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.CheckoutAddressBody
import com.manoosh.app.core.network.CheckoutBody
import com.manoosh.app.core.network.StoreApi
import com.manoosh.app.data.mapper.toDomain
import com.manoosh.app.data.mapper.toPlaceOrderResult
import com.manoosh.app.domain.CheckoutAddress
import com.manoosh.app.domain.PaymentMethodUi
import com.manoosh.app.domain.PlaceOrderResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CheckoutRepository @Inject constructor(
    private val api: StoreApi
) {
    private fun CheckoutAddress.toBody() = CheckoutAddressBody(
        firstName = firstName, lastName = lastName, company = company,
        address1 = address1, address2 = address2, city = city, state = state,
        postcode = postcode, country = country.ifBlank { "IR" },
        email = email, phone = phone
    )

    suspend fun paymentMethods(): ApiResult<List<PaymentMethodUi>> =
        safeCall { api.checkoutData().paymentMethods?.map { it.toDomain() }.orEmpty() }

    suspend fun placeOrder(
        billing: CheckoutAddress,
        shipping: CheckoutAddress,
        paymentMethod: String,
        note: String
    ): ApiResult<PlaceOrderResult> =
        safeCall {
            api.checkout(
                CheckoutBody(
                    billingAddress = billing.toBody(),
                    shippingAddress = shipping.toBody(),
                    paymentMethod = paymentMethod,
                    customerNote = note
                )
            ).toPlaceOrderResult(Config::orderPayUrl)
        }
}
