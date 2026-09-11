package com.manoosh.app.data.mapper

import android.os.Build
import android.text.Html
import com.manoosh.app.core.common.minorToLong
import com.manoosh.app.core.network.AttributeDto
import com.manoosh.app.core.network.BannerDto
import com.manoosh.app.core.network.CartAddressDto
import com.manoosh.app.core.network.CartDto
import com.manoosh.app.core.network.CartItemDto
import com.manoosh.app.core.network.CategoryDto
import com.manoosh.app.core.network.CheckoutResponseDto
import com.manoosh.app.core.network.HomeConfigDto
import com.manoosh.app.core.network.ImageDto
import com.manoosh.app.core.network.OrderAddressDto
import com.manoosh.app.core.network.OrderDto
import com.manoosh.app.core.network.OrderLineItemDto
import com.manoosh.app.core.network.PaymentMethodDto
import com.manoosh.app.core.network.PricesDto
import com.manoosh.app.core.network.ProductDto
import com.manoosh.app.core.network.ReviewDto
import com.manoosh.app.core.network.ShippingPackageDto
import com.manoosh.app.core.network.VariationDto
import com.manoosh.app.domain.BannerUi
import com.manoosh.app.domain.CartItemUi
import com.manoosh.app.domain.CartUi
import com.manoosh.app.domain.Category
import com.manoosh.app.domain.CheckoutAddress
import com.manoosh.app.domain.HomeConfigUi
import com.manoosh.app.domain.Order
import com.manoosh.app.domain.OrderAddress
import com.manoosh.app.domain.OrderItem
import com.manoosh.app.domain.PaymentMethodUi
import com.manoosh.app.domain.PlaceOrderResult
import com.manoosh.app.domain.Product
import com.manoosh.app.domain.ProductAttribute
import com.manoosh.app.domain.ProductCategoryRef
import com.manoosh.app.domain.ProductImage
import com.manoosh.app.domain.Review
import com.manoosh.app.domain.ShippingOptionUi
import com.manoosh.app.domain.ShippingPackageUi
import com.manoosh.app.domain.VariationUi

fun String?.stripHtml(): String {
    if (this.isNullOrBlank()) return ""
    return try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            Html.fromHtml(this, Html.FROM_HTML_MODE_LEGACY).toString().trim()
        } else {
            @Suppress("DEPRECATION")
            Html.fromHtml(this).toString().trim()
        }
    } catch (_: Exception) {
        this.replace(Regex("<[^>]*>"), "").trim()
    }
}

private fun ImageDto.toDomain() = ProductImage(
    src = src.orEmpty(),
    thumbnail = thumbnail?.takeIf { it.isNotBlank() } ?: src.orEmpty(),
    alt = alt.orEmpty()
)

private fun AttributeDto.toDomain() = ProductAttribute(
    name = name.orEmpty(),
    options = terms?.mapNotNull { it.name } ?: emptyList()
)

fun ProductDto.toDomain() = Product(
    id = id,
    name = name.orEmpty().stripHtml(),
    slug = slug.orEmpty(),
    permalink = permalink.orEmpty(),
    sku = sku.orEmpty(),
    type = type.orEmpty(),
    priceMinor = prices?.price.minorToLong(),
    regularMinor = prices?.regularPrice.minorToLong(),
    saleMinor = prices?.salePrice.minorToLong(),
    minorUnit = prices?.minorUnit ?: 0,
    currencySuffix = prices?.suffix?.takeIf { it.isNotBlank() }
        ?: prices?.currencySymbol.orEmpty(),
    images = images?.map { it.toDomain() } ?: emptyList(),
    categories = categories?.map {
        ProductCategoryRef(it.id ?: 0, it.name.orEmpty(), it.slug.orEmpty())
    } ?: emptyList(),
    shortDescription = shortDescription.stripHtml(),
    description = description.orEmpty(),
    rating = averageRating?.toFloatOrNull() ?: 0f,
    reviewCount = reviewCount ?: 0,
    purchasable = isPurchasable != false,
    inStock = isInStock != false,
    onSale = isOnSale == true,
    lowStockRemaining = lowStockRemaining?.takeIf { it > 0 },
    soldIndividually = soldIndividually == true,
    maxQty = addToCart?.maximum ?: quantityLimit ?: 99,
    attributes = attributes?.map { it.toDomain() } ?: emptyList(),
    hasVariations = type == "variable" || !variations.isNullOrEmpty()
)

fun CategoryDto.toDomain() = Category(
    id = id,
    name = name.orEmpty().stripHtml(),
    slug = slug.orEmpty(),
    parentId = parent ?: 0,
    imageUrl = image?.src.orEmpty(),
    count = count ?: 0
)

fun ReviewDto.toDomain() = Review(
    id = id,
    dateIso = dateCreated.orEmpty(),
    text = review.stripHtml(),
    author = name.orEmpty(),
    rating = rating ?: 0,
    verified = verified == true
)

fun VariationDto.toDomain() = VariationUi(
    id = id,
    options = attributes?.associate { (it.name.orEmpty()) to (it.option.orEmpty()) } ?: emptyMap(),
    priceMinor = price.minorToLong(),
    regularMinor = regularPrice.minorToLong(),
    saleMinor = salePrice.minorToLong(),
    inStock = inStock != false,
    imageUrl = imageSrc.orEmpty()
)

fun CartItemDto.toDomain() = CartItemUi(
    key = key.orEmpty(),
    productId = id,
    name = name.orEmpty().stripHtml(),
    imageUrl = images?.firstOrNull()?.src.orEmpty(),
    permalink = permalink.orEmpty(),
    unitMinor = prices?.price.minorToLong(),
    totalMinor = totals?.lineTotal.minorToLong(),
    minorUnit = prices?.minorUnit ?: totals?.minorUnit ?: 0,
    suffix = prices?.suffix?.takeIf { it.isNotBlank() }
        ?: totals?.suffix?.takeIf { it.isNotBlank() }.orEmpty(),
    quantity = quantity,
    maxQty = quantityLimits?.maximum ?: 99,
    soldIndividually = soldIndividually == true,
    variationText = variation
        ?.mapNotNull { v ->
            val value = v.value.stripHtml()
            if (value.isBlank()) null else value
        }
        ?.joinToString("، ")
        .orEmpty()
)

fun ShippingPackageDto.toDomain() = ShippingPackageUi(
    packageId = packageId,
    name = name.orEmpty(),
    options = shippingRates?.map {
        ShippingOptionUi(
            rateId = it.rateId.orEmpty(),
            name = it.name.orEmpty(),
            description = (it.description ?: it.deliveryTime).stripHtml(),
            priceMinor = it.price.minorToLong(),
            selected = it.selected == true
        )
    } ?: emptyList()
)

fun CartDto.toDomain() = CartUi(
    items = items?.map { it.toDomain() } ?: emptyList(),
    coupons = coupons?.mapNotNull { it.code } ?: emptyList(),
    subtotalMinor = totals?.totalItems.minorToLong(),
    discountMinor = totals?.totalDiscount.minorToLong(),
    shippingMinor = totals?.totalShipping.minorToLong(),
    totalMinor = totals?.totalPrice.minorToLong(),
    minorUnit = totals?.minorUnit ?: 0,
    suffix = totals?.suffix.orEmpty(),
    count = itemsCount ?: items?.sumOf { it.quantity } ?: 0,
    needsShipping = needsShipping != false,
    shippingPackages = shippingRates?.map { it.toDomain() } ?: emptyList()
)

fun CartAddressDto.toCheckout() = CheckoutAddress(
    firstName = firstName.orEmpty(),
    lastName = lastName.orEmpty(),
    company = company.orEmpty(),
    address1 = address1.orEmpty(),
    address2 = address2.orEmpty(),
    city = city.orEmpty(),
    state = state.orEmpty(),
    postcode = postcode.orEmpty(),
    country = country?.takeIf { it.isNotBlank() } ?: "IR",
    email = email.orEmpty(),
    phone = phone.orEmpty()
)

fun PaymentMethodDto.toDomain() = PaymentMethodUi(
    id = id.orEmpty(),
    title = label?.takeIf { it.isNotBlank() } ?: title?.takeIf { it.isNotBlank() } ?: id.orEmpty(),
    description = description.stripHtml()
)

fun CheckoutResponseDto.toPlaceOrderResult(fallbackOrderPayUrl: (Long, String) -> String): PlaceOrderResult {
    val orderId = orderId ?: 0L
    val key = orderKey.orEmpty()
    val status = paymentResult?.paymentStatus.orEmpty()
    var url = paymentResult?.redirectUrl?.takeIf { it.isNotBlank() }
    if (url == null) {
        url = paymentResult?.paymentDetails
            ?.mapNotNull { it.value?.takeIf { v -> v.startsWith("http") } }
            ?.firstOrNull()
    }
    if (url == null && orderId > 0 && key.isNotBlank() && status != "success") {
        url = fallbackOrderPayUrl(orderId, key)
    }
    return PlaceOrderResult(
        orderId = orderId,
        orderKey = key,
        paymentStatus = status.ifBlank { this.status.orEmpty() },
        redirectUrl = url,
        needsWebView = url != null && status != "success"
    )
}

private fun OrderAddressDto.toDomain() = OrderAddress(
    firstName = firstName.orEmpty(),
    lastName = lastName.orEmpty(),
    address1 = address1.orEmpty(),
    city = city.orEmpty(),
    state = state.orEmpty(),
    postcode = postcode.orEmpty(),
    phone = phone.orEmpty()
)

private fun OrderLineItemDto.toDomain() = OrderItem(
    name = name.orEmpty(),
    quantity = quantity ?: 0,
    totalMajor = total.orEmpty(),
    imageUrl = image?.src.orEmpty()
)

fun OrderDto.toDomain() = Order(
    id = id,
    status = status.orEmpty(),
    dateIso = dateCreated.orEmpty(),
    totalMajor = total.orEmpty(),
    paymentTitle = paymentMethodTitle.orEmpty(),
    billing = billing?.toDomain(),
    shipping = shipping?.toDomain(),
    items = lineItems?.map { it.toDomain() } ?: emptyList(),
    note = customerNote.orEmpty()
)

fun BannerDto.toDomain() = BannerUi(
    imageUrl = image.orEmpty(),
    title = title.orEmpty(),
    linkType = linkType?.lowercase().orEmpty(),
    linkValue = linkValue.orEmpty()
)

fun HomeConfigDto.toDomain() = HomeConfigUi(
    banners = banners?.map { it.toDomain() }?.filter { it.imageUrl.isNotBlank() } ?: emptyList(),
    featuredCategoryIds = featuredCategoryIds ?: emptyList(),
    amazingTitle = amazingTitle?.takeIf { it.isNotBlank() } ?: "پیشنهاد شگفت‌انگیز",
    amazingHours = amazingHours ?: 24
)
