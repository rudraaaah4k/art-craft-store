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
    const response = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    })
    if (!response.ok) setError('Unable to update cart.')
    else await loadCart()
    window.dispatchEvent(new Event('cart-updated'))
  }

  async function removeItem(id: string) {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) setError('Unable to remove item.')
    else await loadCart()
    window.dispatchEvent(new Event('cart-updated'))
  }

  const subtotal = items.reduce((total, item) => total + itemPrice(item) * item.quantity, 0)

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full px-4 py-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-sand border-t-terracotta rounded-full animate-spin mb-4" />
        <p className="text-charcoal/70 text-base font-serif">Loading your cart items...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 pb-4 border-b border-sand">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal tracking-tight">Your Cart</h1>
        <p className="text-charcoal/60 text-sm mt-1">Review your selected items before proceeding to checkout</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 bg-terracotta/5 border border-terracotta/20 p-4 rounded-xl text-terracotta flex items-center gap-3 transition-opacity duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white/70 border border-sand p-12 sm:p-16 text-center rounded-2xl flex flex-col items-center justify-center min-h-[40vh] shadow-sm">
          <div className="w-16 h-16 bg-sand/30 rounded-full flex items-center justify-center text-charcoal/40 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Your cart is empty</h2>
          <p className="text-charcoal/70 mb-8 max-w-md mx-auto text-sm sm:text-base">
            It looks like you haven&apos;t added any handcrafted items to your cart yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center min-h-[48px] bg-terracotta text-white px-8 py-3 font-semibold hover:bg-charcoal active:scale-[0.98] transition-all duration-150 rounded-xl shadow-sm text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 sm:gap-5 border border-sand bg-white/70 p-4 rounded-xl shadow-sm hover:shadow transition-shadow duration-150"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-sand/20 rounded-lg overflow-hidden">
                  <Image src={item.product.image} alt={item.product.title} fill sizes="112px" className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-serif font-semibold text-base sm:text-lg text-charcoal hover:text-terracotta transition-colors line-clamp-1"
                    >
                      {item.product.title}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-charcoal/60 mt-0.5">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="mt-1 font-bold text-charcoal text-sm sm:text-base">
                      ₹{(itemPrice(item) / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <div className="flex items-center border border-sand rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => void updateItem(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${item.product.title}`}
                        className="w-8 h-8 flex items-center justify-center hover:bg-sand/30 active:scale-95 transition-transform duration-100 text-charcoal font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => void updateItem(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity for ${item.product.title}`}
                        className="w-8 h-8 flex items-center justify-center hover:bg-sand/30 active:scale-95 transition-transform duration-100 text-charcoal font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => void removeItem(item.id)}
                      className="ml-3 text-xs font-medium text-terracotta hover:underline p-1 min-h-[36px] flex items-center"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal sm:text-lg">
                    ₹{((itemPrice(item) * item.quantity) / 100).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <aside className="border border-sand bg-white p-6 rounded-xl shadow-sm h-fit space-y-5">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-3 border-b border-sand/60">
              Order Summary
            </h2>
            <div className="flex justify-between text-base font-semibold text-charcoal pt-1">
              <span>Subtotal</span>
              <span className="font-bold">₹{(subtotal / 100).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-charcoal/60">Taxes calculated. Free shipping eligible on prepaid orders above ₹999.</p>
            <Link
              href="/checkout"
              className="mt-6 block text-center bg-terracotta text-white px-5 py-3.5 font-semibold hover:bg-charcoal active:scale-[0.98] transition-all duration-150 rounded-xl shadow-sm text-sm min-h-[48px] flex items-center justify-center"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}