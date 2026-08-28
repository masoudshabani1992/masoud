import type { Category, Product } from './types'

/**
 * Base URL for the WooCommerce Store API.
 *
 * We call the site directly. The WooCommerce Store API enables CORS
 * (`Access-Control-Allow-Origin: *`) and exposes the `Cart-Token` / `Nonce`
 * headers, so it can be consumed straight from the browser and from the
 * native Capacitor app alike. An optional Vite proxy at `/api/store` is left
 * in vite.config.ts for local development behind a firewall.
 */
export const API_BASE = 'https://manooshorganic.com/wp-json/wc/store/v1'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text.slice(0, 120)}`)
  }
  return res.json() as Promise<T>
}

export interface ProductQuery {
  page?: number
  per_page?: number
  search?: string
  category?: number | string
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title'
  order?: 'asc' | 'desc'
  on_sale?: boolean
  featured?: boolean
}

export function buildProductQuery(q: ProductQuery = {}): string {
  const p = new URLSearchParams()
  p.set('per_page', String(q.per_page ?? 20))
  if (q.page) p.set('page', String(q.page))
  if (q.search) p.set('search', q.search)
  if (q.category) p.set('category', String(q.category))
  if (q.orderby) p.set('orderby', q.orderby)
  if (q.order) p.set('order', q.order)
  if (q.on_sale) p.set('on_sale', 'true')
  if (q.featured) p.set('featured', 'true')
  return p.toString()
}

export function getProducts(q: ProductQuery = {}): Promise<Product[]> {
  return req<Product[]>(`/products?${buildProductQuery(q)}`)
}

export function getProduct(id: number | string): Promise<Product> {
  return req<Product>(`/products/${id}`)
}

export function getCategories(): Promise<Category[]> {
  return req<Category[]>('/products/categories?per_page=100&orderby=count&order=desc&hide_empty=true')
}

export function getCategory(id: number | string): Promise<Category> {
  return req<Category>(`/products/categories/${id}`)
}
