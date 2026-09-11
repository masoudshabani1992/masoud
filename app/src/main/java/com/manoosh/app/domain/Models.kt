package com.manoosh.app.domain

// ---------- Catalog ----------

data class ProductImage(val src: String, val thumbnail: String, val alt: String = "")

data class ProductCategoryRef(val id: Long, val name: String, val slug: String)

data class ProductAttribute(val name: String, val options: List<String>)

data class Product(
    val id: Long,
    val name: String,
    val slug: String,
    val permalink: String,
    val sku: String,
    val type: String,
    val priceMinor: Long?,
    val regularMinor: Long?,
    val saleMinor: Long?,
    val minorUnit: Int,
    val currencySuffix: String,
    val images: List<ProductImage>,
    val categories: List<ProductCategoryRef>,
    val shortDescription: String,
    val description: String,
    val rating: Float,
    val reviewCount: Int,
    val purchasable: Boolean,
    val inStock: Boolean,
    val onSale: Boolean,
    val lowStockRemaining: Int?,
    val soldIndividually: Boolean,
    val maxQty: Int,
    val attributes: List<ProductAttribute>,
    val hasVariations: Boolean
) {
    val mainImage: String get() = images.firstOrNull()?.src.orEmpty()
    val discountPercent: Int
        get() {
            val reg = regularMinor ?: return 0
            val sale = saleMinor ?: return 0
            if (reg <= 0 || sale <= 0 || sale >= reg) return 0
            return (((reg - sale) * 100) / reg).toInt().coerceIn(1, 99)
        }
}

data class Category(
    val id: Long,
    val name: String,
    val slug: String,
    val parentId: Long,
    val imageUrl: String,
    val count: Int
)

data class Review(
    val id: Long,
    val dateIso: String,
    val text: String,
    val author: String,
    val rating: Int,
    val verified: Boolean
)

data class VariationUi(
    val id: Long,
    val options: Map<String, String>,
    val priceMinor: Long?,
    val regularMinor: Long?,
    val saleMinor: Long?,
    val inStock: Boolean,
    val imageUrl: String
)

enum class SortOption { NEWEST, CHEAPEST, EXPENSIVE, POPULAR, RATING }

// ---------- Cart & checkout ----------

data class CartItemUi(
    val key: String,
    val productId: Long,
    val name: String,
    val imageUrl: String,
    val permalink: String,
    val unitMinor: Long?,
    val totalMinor: Long?,
    val minorUnit: Int,
    val suffix: String,
    val quantity: Int,
    val maxQty: Int,
    val soldIndividually: Boolean,
    val variationText: String
)

data class ShippingOptionUi(
    val rateId: String,
    val name: String,
    val description: String,
    val priceMinor: Long?,
    val selected: Boolean
)

data class ShippingPackageUi(
    val packageId: String,
    val name: String,
    val options: List<ShippingOptionUi>
)

data class CartUi(
    val items: List<CartItemUi> = emptyList(),
    val coupons: List<String> = emptyList(),
    val subtotalMinor: Long? = 0,
    val discountMinor: Long? = 0,
    val shippingMinor: Long? = 0,
    val totalMinor: Long? = 0,
    val minorUnit: Int = 0,
    val suffix: String = "",
    val count: Int = 0,
    val needsShipping: Boolean = true,
    val shippingPackages: List<ShippingPackageUi> = emptyList()
) {
    val isEmpty: Boolean get() = items.isEmpty()
}

data class CheckoutAddress(
    val firstName: String = "",
    val lastName: String = "",
    val company: String = "",
    val address1: String = "",
    val address2: String = "",
    val city: String = "",
    val state: String = "",
    val postcode: String = "",
    val country: String = "IR",
    val email: String = "",
    val phone: String = ""
)

data class PaymentMethodUi(val id: String, val title: String, val description: String)

data class PlaceOrderResult(
    val orderId: Long,
    val orderKey: String,
    val paymentStatus: String,
    val redirectUrl: String?,
    val needsWebView: Boolean
)

// ---------- Orders ----------

data class OrderItem(val name: String, val quantity: Int, val totalMajor: String, val imageUrl: String)

data class OrderAddress(
    val firstName: String,
    val lastName: String,
    val address1: String,
    val city: String,
    val state: String,
    val postcode: String,
    val phone: String
)

data class Order(
    val id: Long,
    val status: String,
    val dateIso: String,
    val totalMajor: String,
    val paymentTitle: String,
    val billing: OrderAddress?,
    val shipping: OrderAddress?,
    val items: List<OrderItem>,
    val note: String
)

// ---------- Home / misc ----------

data class BannerUi(
    val imageUrl: String,
    val title: String,
    val linkType: String, // product | category | url
    val linkValue: String
)

data class HomeConfigUi(
    val banners: List<BannerUi>,
    val featuredCategoryIds: List<Long>,
    val amazingTitle: String,
    val amazingHours: Int
)

data class SavedAddress(
    val id: String,
    val title: String,
    val address: CheckoutAddress
)

data class FavoriteItem(
    val id: Long,
    val name: String,
    val imageUrl: String,
    val priceMinor: Long?,
    val regularMinor: Long?,
    val minorUnit: Int,
    val suffix: String,
    val permalink: String
)
