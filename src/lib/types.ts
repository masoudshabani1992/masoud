export interface ProductImage {
  id: number
  src: string
  thumbnail: string
  name: string
  alt: string
}

export interface Prices {
  price: string
  regular_price: string
  sale_price: string
  price_range: null | { min_amount: string; max_amount: string }
  currency_code: string
  currency_symbol: string
  currency_minor_unit: number
  currency_prefix: string
  currency_suffix: string
  currency_thousand_separator: string
  currency_decimal_separator: string
}

export interface ProductCategoryRef {
  id: number
  name: string
  slug: string
  link?: string
}

export interface Product {
  id: number
  name: string
  slug: string
  parent: number
  type: string
  variation: string
  permalink: string
  sku: string
  short_description: string
  description: string
  on_sale: boolean
  prices: Prices
  price_html?: string
  average_rating: string
  review_count: number
  images: ProductImage[]
  categories: ProductCategoryRef[]
  is_in_stock: boolean
  is_purchasable: boolean
  add_to_cart?: { text: string; description: string }
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  parent: number
  count: number
  image: ProductImage | null
  review_count: number
  permalink: string
}

export interface CartLine {
  id: number
  name: string
  price: number
  image: string
  slug: string
  qty: number
  max?: number
}
