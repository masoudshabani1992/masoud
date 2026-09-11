package com.manoosh.app.core.network

import com.google.gson.annotations.SerializedName

// ---------- wc/v3 (authenticated: orders, customer profile) ----------

data class OrderLineItemDto(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("quantity") val quantity: Int? = null,
    @SerializedName("total") val total: String? = null,
    @SerializedName("image") val image: ImageDto? = null
)

data class OrderAddressDto(
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    @SerializedName("address_1") val address1: String? = null,
    @SerializedName("address_2") val address2: String? = null,
    @SerializedName("city") val city: String? = null,
    @SerializedName("state") val state: String? = null,
    @SerializedName("postcode") val postcode: String? = null,
    @SerializedName("country") val country: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("phone") val phone: String? = null
)

data class OrderDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("status") val status: String? = null,
    @SerializedName("currency") val currency: String? = null,
    @SerializedName("date_created") val dateCreated: String? = null,
    @SerializedName("total") val total: String? = null,
    @SerializedName("payment_method_title") val paymentMethodTitle: String? = null,
    @SerializedName("billing") val billing: OrderAddressDto? = null,
    @SerializedName("shipping") val shipping: OrderAddressDto? = null,
    @SerializedName("line_items") val lineItems: List<OrderLineItemDto>? = null,
    @SerializedName("customer_note") val customerNote: String? = null
)

data class CustomerAddressDto(
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    @SerializedName("company") val company: String? = null,
    @SerializedName("address_1") val address1: String? = null,
    @SerializedName("address_2") val address2: String? = null,
    @SerializedName("city") val city: String? = null,
    @SerializedName("state") val state: String? = null,
    @SerializedName("postcode") val postcode: String? = null,
    @SerializedName("country") val country: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("phone") val phone: String? = null
)

data class CustomerDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("email") val email: String? = null,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    @SerializedName("billing") val billing: CustomerAddressDto? = null,
    @SerializedName("shipping") val shipping: CustomerAddressDto? = null
)

data class CustomerUpdateBody(
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    @SerializedName("billing") val billing: CustomerAddressDto? = null,
    @SerializedName("shipping") val shipping: CustomerAddressDto? = null
)
