package com.manoosh.app.core.network

import com.google.gson.annotations.SerializedName

// ---------- Manoosh companion plugin (wp-json/manoosh/v1) ----------
// Provided by wp-plugin/manoosh-app-auth (OTP auth, home config, variations).

data class OtpRequestBody(
    @SerializedName("phone") val phone: String
)

data class OtpResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("expires_in") val expiresIn: Int? = null
)

data class OtpVerifyBody(
    @SerializedName("phone") val phone: String,
    @SerializedName("code") val code: String
)

data class OtpUserDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("name") val name: String? = null,
    @SerializedName("phone") val phone: String? = null
)

data class OtpVerifyResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("app_password") val appPassword: String? = null,
    @SerializedName("username") val username: String? = null,
    @SerializedName("user") val user: OtpUserDto? = null,
    @SerializedName("customer_id") val customerId: Long? = null
)

data class BannerDto(
    @SerializedName("image") val image: String? = null,
    @SerializedName("title") val title: String? = null,
    @SerializedName("link_type") val linkType: String? = null, // product | category | url
    @SerializedName("link_value") val linkValue: String? = null
)

data class HomeConfigDto(
    @SerializedName("banners") val banners: List<BannerDto>? = null,
    @SerializedName("featured_category_ids") val featuredCategoryIds: List<Long>? = null,
    @SerializedName("amazing_title") val amazingTitle: String? = null,
    @SerializedName("amazing_hours") val amazingHours: Int? = null
)

data class VariationAttrDto(
    @SerializedName("name") val name: String? = null,
    @SerializedName("option") val option: String? = null
)

data class PayUrlResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("url") val url: String? = null,
    @SerializedName("message") val message: String? = null
)

data class VariationDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("attributes") val attributes: List<VariationAttrDto>? = null,
    @SerializedName("price") val price: String? = null,
    @SerializedName("regular_price") val regularPrice: String? = null,
    @SerializedName("sale_price") val salePrice: String? = null,
    @SerializedName("in_stock") val inStock: Boolean? = null,
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("image_src") val imageSrc: String? = null
)
