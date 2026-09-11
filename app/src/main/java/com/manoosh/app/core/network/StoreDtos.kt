package com.manoosh.app.core.network

import com.google.gson.JsonElement
import com.google.gson.annotations.SerializedName

// ---------- Catalog ----------

data class ImageDto(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("src") val src: String? = null,
    @SerializedName("thumbnail") val thumbnail: String? = null,
    @SerializedName("alt") val alt: String? = null
)

data class PricesDto(
    @SerializedName("price") val price: String? = null,
    @SerializedName("regular_price") val regularPrice: String? = null,
    @SerializedName("sale_price") val salePrice: String? = null,
    @SerializedName("currency_code") val currencyCode: String? = null,
    @SerializedName("currency_symbol") val currencySymbol: String? = null,
    @SerializedName("currency_minor_unit") val minorUnit: Int? = null,
    @SerializedName("currency_prefix") val prefix: String? = null,
    @SerializedName("currency_suffix") val suffix: String? = null
)

data class TermDto(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("slug") val slug: String? = null
)

data class AttributeDto(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("taxonomy") val taxonomy: String? = null,
    @SerializedName("terms") val terms: List<TermDto>? = null
)

data class AddToCartDto(
    @SerializedName("minimum") val minimum: Int? = null,
    @SerializedName("maximum") val maximum: Int? = null,
    @SerializedName("multiple_of") val multipleOf: Int? = null
)

data class CategoryRefDto(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("slug") val slug: String? = null
)

data class ProductDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("name") val name: String? = null,
    @SerializedName("slug") val slug: String? = null,
    @SerializedName("permalink") val permalink: String? = null,
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("type") val type: String? = null,
    @SerializedName("prices") val prices: PricesDto? = null,
    @SerializedName("images") val images: List<ImageDto>? = null,
    @SerializedName("categories") val categories: List<CategoryRefDto>? = null,
    @SerializedName("short_description") val shortDescription: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("average_rating") val averageRating: String? = null,
    @SerializedName("review_count") val reviewCount: Int? = null,
    @SerializedName("is_purchasable") val isPurchasable: Boolean? = null,
    @SerializedName("is_in_stock") val isInStock: Boolean? = null,
    @SerializedName("is_on_sale") val isOnSale: Boolean? = null,
    @SerializedName("low_stock_remaining") val lowStockRemaining: Int? = null,
    @SerializedName("sold_individually") val soldIndividually: Boolean? = null,
    @SerializedName("quantity_limit") val quantityLimit: Int? = null,
    @SerializedName("add_to_cart") val addToCart: AddToCartDto? = null,
    @SerializedName("attributes") val attributes: List<AttributeDto>? = null,
    @SerializedName("variations") val variations: List<Long>? = null
)

data class CategoryDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("name") val name: String? = null,
    @SerializedName("slug") val slug: String? = null,
    @SerializedName("parent") val parent: Long? = 0,
    @SerializedName("description") val description: String? = null,
    @SerializedName("image") val image: ImageDto? = null,
    @SerializedName("count") val count: Int? = null
)

data class ReviewDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("date_created") val dateCreated: String? = null,
    @SerializedName("review") val review: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("rating") val rating: Int? = null,
    @SerializedName("verified") val verified: Boolean? = null
)

// ---------- Cart ----------

data class QuantityLimitsDto(
    @SerializedName("minimum") val minimum: Int? = null,
    @SerializedName("maximum") val maximum: Int? = null,
    @SerializedName("multiple_of") val multipleOf: Int? = null,
    @SerializedName("editable") val editable: Boolean? = null
)

data class VariationItemDto(
    @SerializedName("attribute") val attribute: String? = null,
    @SerializedName("value") val value: String? = null
)

data class ItemDataDto(
    @SerializedName("name") val name: String? = null,
    @SerializedName("value") val value: String? = null
)

data class CartLineTotalsDto(
    @SerializedName("line_subtotal") val lineSubtotal: String? = null,
    @SerializedName("line_total") val lineTotal: String? = null,
    @SerializedName("currency_minor_unit") val minorUnit: Int? = null,
    @SerializedName("currency_suffix") val suffix: String? = null
)

data class CartItemDto(
    @SerializedName("key") val key: String? = null,
    @SerializedName("id") val id: Long = 0,
    @SerializedName("type") val type: String? = null,
    @SerializedName("quantity") val quantity: Int = 0,
    @SerializedName("quantity_limits") val quantityLimits: QuantityLimitsDto? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("low_stock_remaining") val lowStockRemaining: Int? = null,
    @SerializedName("sold_individually") val soldIndividually: Boolean? = null,
    @SerializedName("permalink") val permalink: String? = null,
    @SerializedName("images") val images: List<ImageDto>? = null,
    @SerializedName("variation") val variation: List<VariationItemDto>? = null,
    @SerializedName("item_data") val itemData: List<ItemDataDto>? = null,
    @SerializedName("prices") val prices: PricesDto? = null,
    @SerializedName("totals") val totals: CartLineTotalsDto? = null
)

data class CouponDto(
    @SerializedName("code") val code: String? = null
)

data class ShippingRateOptionDto(
    @SerializedName("rate_id") val rateId: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("delivery_time") val deliveryTime: String? = null,
    @SerializedName("price") val price: String? = null,
    @SerializedName("selected") val selected: Boolean? = null
)

data class ShippingPackageDto(
    // package_id can be int or string depending on Woo version; parse defensively.
    @SerializedName("package_id") val packageIdRaw: JsonElement? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("shipping_rates") val shippingRates: List<ShippingRateOptionDto>? = null
) {
    val packageId: String
        get() = try {
            when {
                packageIdRaw == null || packageIdRaw.isJsonNull -> "0"
                packageIdRaw.isJsonPrimitive -> packageIdRaw.asString
                else -> "0"
            }
        } catch (_: Exception) {
            "0"
        }
}

data class CartTotalsFullDto(
    @SerializedName("total_items") val totalItems: String? = null,
    @SerializedName("total_discount") val totalDiscount: String? = null,
    @SerializedName("total_shipping") val totalShipping: String? = null,
    @SerializedName("total_price") val totalPrice: String? = null,
    @SerializedName("currency_minor_unit") val minorUnit: Int? = null,
    @SerializedName("currency_suffix") val suffix: String? = null
)

data class CartAddressDto(
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

data class CartDto(
    @SerializedName("items") val items: List<CartItemDto>? = null,
    @SerializedName("coupons") val coupons: List<CouponDto>? = null,
    @SerializedName("totals") val totals: CartTotalsFullDto? = null,
    @SerializedName("shipping_rates") val shippingRates: List<ShippingPackageDto>? = null,
    @SerializedName("shipping_address") val shippingAddress: CartAddressDto? = null,
    @SerializedName("billing_address") val billingAddress: CartAddressDto? = null,
    @SerializedName("items_count") val itemsCount: Int? = null,
    @SerializedName("needs_payment") val needsPayment: Boolean? = null,
    @SerializedName("needs_shipping") val needsShipping: Boolean? = null,
    @SerializedName("has_calculated_shipping") val hasCalculatedShipping: Boolean? = null
)

// ---------- Checkout ----------

data class PaymentMethodDto(
    @SerializedName("id") val id: String? = null,
    @SerializedName("label") val label: String? = null,
    @SerializedName("title") val title: String? = null,
    @SerializedName("description") val description: String? = null
)

data class CheckoutDataDto(
    @SerializedName("payment_methods") val paymentMethods: List<PaymentMethodDto>? = null
)

data class CheckoutAddressBody(
    @SerializedName("first_name") val firstName: String = "",
    @SerializedName("last_name") val lastName: String = "",
    @SerializedName("company") val company: String = "",
    @SerializedName("address_1") val address1: String = "",
    @SerializedName("address_2") val address2: String = "",
    @SerializedName("city") val city: String = "",
    @SerializedName("state") val state: String = "",
    @SerializedName("postcode") val postcode: String = "",
    @SerializedName("country") val country: String = "IR",
    @SerializedName("email") val email: String = "",
    @SerializedName("phone") val phone: String = ""
)

data class PaymentDataItem(
    @SerializedName("key") val key: String,
    @SerializedName("value") val value: String
)

data class CheckoutBody(
    @SerializedName("billing_address") val billingAddress: CheckoutAddressBody,
    @SerializedName("shipping_address") val shippingAddress: CheckoutAddressBody,
    @SerializedName("payment_method") val paymentMethod: String,
    @SerializedName("customer_note") val customerNote: String = "",
    @SerializedName("payment_data") val paymentData: List<PaymentDataItem> = emptyList()
)

data class PaymentDetailDto(
    @SerializedName("key") val key: String? = null,
    @SerializedName("value") val value: String? = null
)

data class PaymentResultDto(
    @SerializedName("payment_status") val paymentStatus: String? = null,
    @SerializedName("payment_details") val paymentDetails: List<PaymentDetailDto>? = null,
    @SerializedName("redirect_url") val redirectUrl: String? = null
)

data class CheckoutResponseDto(
    @SerializedName("order_id") val orderId: Long? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("order_key") val orderKey: String? = null,
    @SerializedName("customer_note") val customerNote: String? = null,
    @SerializedName("payment_method") val paymentMethod: String? = null,
    @SerializedName("payment_result") val paymentResult: PaymentResultDto? = null
)

// ---------- Request bodies ----------

data class AddItemBody(
    @SerializedName("id") val id: Long,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("variation") val variation: List<VariationItemDto>? = null
)

data class UpdateItemBody(
    @SerializedName("key") val key: String,
    @SerializedName("quantity") val quantity: Int
)

data class RemoveItemBody(
    @SerializedName("key") val key: String
)

data class CouponBody(
    @SerializedName("code") val code: String
)

data class SelectShippingBody(
    @SerializedName("rate_id") val rateId: String
)

data class UpdateCustomerBody(
    @SerializedName("billing_address") val billingAddress: CheckoutAddressBody? = null,
    @SerializedName("shipping_address") val shippingAddress: CheckoutAddressBody? = null
)
