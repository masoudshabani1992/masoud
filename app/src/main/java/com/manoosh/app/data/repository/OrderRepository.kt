package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.CustomerAddressDto
import com.manoosh.app.core.network.CustomerDto
import com.manoosh.app.core.network.CustomerUpdateBody
import com.manoosh.app.core.network.WcV3Api
import com.manoosh.app.data.mapper.toDomain
import com.manoosh.app.domain.CheckoutAddress
import com.manoosh.app.domain.Order
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val api: WcV3Api,
    private val manooshApi: com.manoosh.app.core.network.ManooshApi
) {
    /** Secure order-pay URL for unpaid orders (plugin verifies ownership). */
    suspend fun payUrl(orderId: Long): ApiResult<String> =
        safeCall {
            val res = manooshApi.orderPayUrl(orderId)
            if (!res.success || res.url.isNullOrBlank()) {
                throw IllegalStateException(res.message ?: "امکان پرداخت آنلاین برای این سفارش وجود ندارد")
            }
            res.url
        }

    suspend fun orders(customerId: Long, page: Int = 1): ApiResult<List<Order>> {
        if (customerId <= 0) return ApiResult.Error("login_required")
        return safeCall { api.orders(customerId, page = page).map { it.toDomain() } }
    }

    suspend fun order(orderId: Long): ApiResult<Order> =
        safeCall { api.order(orderId).toDomain() }

    suspend fun customer(customerId: Long): ApiResult<CustomerDto> {
        if (customerId <= 0) return ApiResult.Error("login_required")
        return safeCall { api.customer(customerId) }
    }

    suspend fun syncAddress(
        customerId: Long,
        firstName: String,
        lastName: String,
        address: CheckoutAddress
    ): ApiResult<CustomerDto> {
        if (customerId <= 0) return ApiResult.Error("login_required")
        val dto = CustomerAddressDto(
            firstName = firstName, lastName = lastName,
            address1 = address.address1, address2 = address.address2,
            city = address.city, state = address.state, postcode = address.postcode,
            country = address.country.ifBlank { "IR" }, phone = address.phone
        )
        return safeCall {
            api.updateCustomer(customerId, CustomerUpdateBody(firstName, lastName, dto, dto))
        }
    }
}
