import { API_BASE } from './api'
import type { CartLine } from './types'

export interface BillingInfo {
  first_name: string
  last_name: string
  phone: string
  email: string
  address_1: string
  city: string
  state: string
  postcode: string
}

export interface PlacedOrder {
  order_id: number
  status: string
  total?: string
  payment_url?: string
}

/**
 * Places an order through the WooCommerce Store API (guest checkout).
 * Flow: fetch cart tokens -> clear -> add items -> checkout with COD.
 * The Store API returns `Cart-Token` and `Nonce` headers that must be echoed back.
 */
export async function placeOrder(items: CartLine[], billing: BillingInfo): Promise<PlacedOrder> {
  // 1) Prime the cart to obtain tokens
  const bootstrap = await fetch(`${API_BASE}/cart`, { headers: { Accept: 'application/json' } })
  let cartToken = bootstrap.headers.get('Cart-Token') || ''
  let nonce = bootstrap.headers.get('Nonce') || bootstrap.headers.get('X-WC-Store-API-Nonce') || ''

  const authHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
    if (cartToken) h['Cart-Token'] = cartToken
    if (nonce) h['Nonce'] = nonce
    return h
  }

  const captureTokens = (res: Response) => {
    const c = res.headers.get('Cart-Token')
    const n = res.headers.get('Nonce') || res.headers.get('X-WC-Store-API-Nonce')
    if (c) cartToken = c
    if (n) nonce = n
  }

  // 2) Empty any existing lines then add ours
  await fetch(`${API_BASE}/cart/items`, { method: 'DELETE', headers: authHeaders() }).then(captureTokens).catch(() => {})

  for (const line of items) {
    const res = await fetch(`${API_BASE}/cart/add-item`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ id: line.id, quantity: line.qty }),
    })
    captureTokens(res)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message || `افزودن «${line.name}» به سبد ناموفق بود`)
    }
  }

  // 3) Checkout via Zarinpal (WC_ZPal) — the payment gateway enabled on the site.
  //    The response contains payment_result.redirect_url pointing to the gateway.
  const body = {
    billing_address: {
      first_name: billing.first_name,
      last_name: billing.last_name,
      address_1: billing.address_1,
      address_2: '',
      city: billing.city,
      state: billing.state,
      postcode: billing.postcode,
      country: 'IR',
      email: billing.email,
      phone: billing.phone,
    },
    shipping_address: {
      first_name: billing.first_name,
      last_name: billing.last_name,
      address_1: billing.address_1,
      address_2: '',
      city: billing.city,
      state: billing.state,
      postcode: billing.postcode,
      country: 'IR',
      phone: billing.phone,
    },
    payment_method: 'WC_ZPal',
    customer_note: 'ثبت‌شده از اپلیکیشن موبایل مانوش',
  }

  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || 'ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.')
  }

  return {
    order_id: data.order_id,
    status: data.status,
    total: data?.totals?.total_price,
    payment_url: data?.payment_result?.redirect_url,
  }
}
