'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type CartItem = {
  id: string
  quantity: number
  product: { id: string; title: string; slug: string; price: number; salePrice: number | null; image: string }
  variant: { name: string; value: string; price: number | null } | null
}

function itemPrice(item: CartItem) {
  return item.variant?.price ?? item.product.salePrice ?? item.product.price
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCart() {
    setLoading(true)
    const response = await fetch('/api/cart', { cache: 'no-store' })
    const data = await response.json()
    setItems(data.items ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCart() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function updateItem(id: string, quantity: number) {
    if (quantity < 1) return removeItem(id)
    const response = await fetch('/api/cart', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, quantity }) })
    if (!response.ok) setError('Unable to update cart.')
    else await loadCart()
    window.dispatchEvent(new Event('cart-updated'))
  }

  async function removeItem(id: string) {
    const response = await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!response.ok) setError('Unable to remove item.')
    else await loadCart()
    window.dispatchEvent(new Event('cart-updated'))
  }

  const subtotal = items.reduce((total, item) => total + itemPrice(item) * item.quantity, 0)

  if (loading) return <div className="max-w-5xl mx-auto w-full px-4 py-16">Loading cart...</div>

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-8">Your Cart</h1>
      {error && <p className="mb-4 text-terracotta">{error}</p>}
      {items.length === 0 ? (
        <div className="border border-sand bg-white p-8 text-center">
          <p className="text-charcoal/70 mb-5">Your cart is waiting for something beautiful.</p>
          <Link href="/shop" className="inline-block bg-charcoal text-white px-5 py-3 font-medium">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-sand pb-4">
                <div className="relative w-24 h-24 flex-shrink-0 bg-sand/20">
                  <Image src={item.product.image} alt={item.product.title} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="font-medium hover:text-terracotta">{item.product.title}</Link>
                  {item.variant && <p className="text-sm text-charcoal/60">{item.variant.name}: {item.variant.value}</p>}
                  <p className="mt-1 font-bold">₹{(itemPrice(item) / 100).toLocaleString('en-IN')}</p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <button onClick={() => void updateItem(item.id, item.quantity - 1)} aria-label={`Decrease quantity for ${item.product.title}`} className="border border-sand w-8 h-8">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => void updateItem(item.id, item.quantity + 1)} aria-label={`Increase quantity for ${item.product.title}`} className="border border-sand w-8 h-8">+</button>
                    <button onClick={() => void removeItem(item.id)} className="ml-3 text-terracotta hover:underline">Remove</button>
                  </div>
                </div>
                <p className="font-bold">₹{((itemPrice(item) * item.quantity) / 100).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <aside className="border border-sand bg-white p-6 h-fit">
            <h2 className="font-serif text-xl font-bold mb-5">Summary</h2>
            <div className="flex justify-between text-lg font-bold border-t border-sand pt-4"><span>Subtotal</span><span>₹{(subtotal / 100).toLocaleString('en-IN')}</span></div>
            <Link href="/checkout" className="mt-6 block text-center bg-terracotta text-white px-5 py-3 font-medium hover:bg-charcoal">Proceed to Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  )
}