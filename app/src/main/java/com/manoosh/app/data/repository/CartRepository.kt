package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.AddItemBody
import com.manoosh.app.core.network.CheckoutAddressBody
import com.manoosh.app.core.network.CouponBody
import com.manoosh.app.core.network.RemoveItemBody
import com.manoosh.app.core.network.SelectShippingBody
import com.manoosh.app.core.network.StoreApi
import com.manoosh.app.core.network.UpdateCustomerBody
import com.manoosh.app.core.network.UpdateItemBody
import com.manoosh.app.core.network.VariationItemDto
import com.manoosh.app.core.session.CartSessionManager
import com.manoosh.app.data.mapper.toDomain
import com.manoosh.app.domain.CartUi
import com.manoosh.app.domain.CheckoutAddress
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

@Singleton
class CartRepository @Inject constructor(
    private val api: StoreApi,
    private val sessions: CartSessionManager
) {
    private val _cart = MutableStateFlow(CartUi())
    val cart: StateFlow<CartUi> = _cart.asStateFlow()
    val count = cart.map { it.count }

    private fun CheckoutAddress.toBody() = CheckoutAddressBody(
        firstName = firstName, lastName = lastName, company = company,
        address1 = address1, address2 = address2, city = city, state = state,
        postcode = postcode, country = country.ifBlank { "IR" },
        email = email, phone = phone
    )

    suspend fun refresh(): ApiResult<CartUi> {
        val res = safeCall { api.cart().toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun add(
        productId: Long,
        quantity: Int,
        variation: List<VariationItemDto>? = null
    ): ApiResult<CartUi> {
        val res = safeCall { api.addItem(AddItemBody(productId, quantity, variation)).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    /** Adds a variation by its own variation ID (variable products). */
    suspend fun addVariation(variationId: Long, quantity: Int): ApiResult<CartUi> {
        val res = safeCall { api.addItem(AddItemBody(variationId, quantity)).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun setQuantity(key: String, quantity: Int): ApiResult<CartUi> {
        if (quantity <= 0) return remove(key)
        val res = safeCall { api.updateItem(UpdateItemBody(key, quantity)).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun remove(key: String): ApiResult<CartUi> {
        val res = safeCall { api.removeItem(RemoveItemBody(key)).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun applyCoupon(code: String): ApiResult<CartUi> {
        val res = safeCall { api.applyCoupon(CouponBody(code.trim())).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun removeCoupon(code: String): ApiResult<CartUi> {
        val res = safeCall { api.removeCoupon(CouponBody(code)).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun selectShipping(packageId: String, rateId: String): ApiResult<CartUi> {
        val res = safeCall { api.selectShipping(packageId, SelectShippingBody(rateId)).toDomain() }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    suspend fun updateCustomer(billing: CheckoutAddress, shipping: CheckoutAddress): ApiResult<CartUi> {
        val res = safeCall {
            api.updateCustomer(UpdateCustomerBody(billing.toBody(), shipping.toBody())).toDomain()
        }
        if (res is ApiResult.Success) _cart.value = res.data
        return res
    }

    /** Called after a successful order: drop the server cart identity and start fresh. */
    suspend fun resetAfterOrder() {
        sessions.clear()
        _cart.value = CartUi()
        refresh()
    }
}
