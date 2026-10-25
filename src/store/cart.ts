import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine, Product } from '../lib/types'
import { priceToNumber } from '../lib/format'

interface CartState {
  items: CartLine[]
  add: (product: Product, qty?: number) => void
  remove: (id: number) => void
  setQty: (id: number, qty: number) => void
  increment: (id: number) => void
  decrement: (id: number) => void
  clear: () => void
  count: () => number
  total: () => number
  qtyOf: (id: number) => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + qty } : i,
              ),
            }
          }
          const line: CartLine = {
            id: product.id,
            name: product.name,
            price: priceToNumber(product.prices?.price),
            image: product.images?.[0]?.thumbnail || product.images?.[0]?.src || '',
            slug: product.slug,
            qty,
          }
          return { items: [...state.items, line] }
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      increment: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
        })),
      decrement: (id) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      total: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
      qtyOf: (id) => get().items.find((i) => i.id === id)?.qty ?? 0,
    }),
    { name: 'manoosh-cart' },
  ),
)
