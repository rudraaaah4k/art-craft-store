'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Product, Variant } from '@prisma/client'
import { m, AnimatePresence } from 'framer-motion'
import { useReducedMotion, MOTION_TOKENS } from '@/lib/motion'

type ProductData = Product & { variants: Variant[] }

export function ProductActions({ product }: { product: ProductData }) {
  const { data: session } = useSession()
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.length > 0 ? product.variants[0] : null
  )

  // Pincode state
  const [pincode, setPincode] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState<{
    loading: boolean
    msg: string
    error?: boolean
  }>({ loading: false, msg: '' })

  // Wishlist state
  const [wishlistMsg, setWishlistMsg] = useState('')
  const [cartMsg, setCartMsg] = useState('')
  const [cartLoading, setCartLoading] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [scrolledPast, setScrolledPast] = useState(false)
  const reducedMotion = useReducedMotion()

  const activePrice = selectedVariant
    ? selectedVariant.price ?? product.price
    : product.salePrice ?? product.price
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock
  const originalPrice = product.price

  // Track scroll position to show sticky mobile buy bar
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPast(window.scrollY > 380)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function checkDelivery(e: React.FormEvent) {
    e.preventDefault()
    if (!pincode || pincode.length !== 6)
      return setDeliveryStatus({ loading: false, msg: 'Invalid Pincode', error: true })

    setDeliveryStatus({ loading: true, msg: 'Checking...' })
    try {
      const params = new URLSearchParams({
        pincode,
        weight: String(product.weightGrams),
        amount: String(activePrice),
      })
      if (product.lengthCm && product.widthCm && product.heightCm) {
        params.set('length', String(product.lengthCm))
        params.set('width', String(product.widthCm))
        params.set('height', String(product.heightCm))
      }
      const res = await fetch(`/api/shiprocket/check-pincode?${params}`)
      const data = await res.json()
      if (res.ok && data.available) {
        setDeliveryStatus({
          loading: false,
          msg: `Delivery in ${product.processingDays + (data.estimatedDays || 3)} days. ${
            data.rates?.[0]?.courierName ?? 'Delivery'
          } from ₹${((data.rates?.[0]?.amountPaise ?? 0) / 100).toLocaleString('en-IN')}. Cash on Delivery ${
            product.codAllowed && data.codAvailable ? 'Available' : 'Unavailable'
          }.`,
          error: false,
        })
      } else {
        setDeliveryStatus({
          loading: false,
          msg: data.error || 'Delivery not available to this pincode.',
          error: true,
        })
      }
    } catch {
      setDeliveryStatus({ loading: false, msg: 'Error checking delivery.', error: true })
    }
  }

  async function addToWishlist() {
    if (!session) {
      setWishlistMsg('Please log in to save to wishlist.')
      return
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (res.ok) {
        setWishlistMsg('Added to wishlist!')
      } else {
        setWishlistMsg('Failed to add to wishlist.')
      }
    } catch {
      setWishlistMsg('Error adding to wishlist.')
    }
    setTimeout(() => setWishlistMsg(''), 3000)
  }

  async function addToCart() {
    setCartLoading(true)
    setCartMsg('')
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id ?? null,
          quantity: 1,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setCartMsg(data.error || 'Unable to add to cart.')
      } else {
        setCartMsg('Added to cart.')
        setJustAdded(true)
        window.dispatchEvent(new Event('cart-updated'))
        setTimeout(() => setJustAdded(false), 2000)
      }
    } catch {
      setCartMsg('Unable to add to cart.')
    } finally {
      setCartLoading(false)
      setTimeout(() => setCartMsg(''), 3000)
    }
  }

  return (
    <>
      {/* Price Block */}
      <div className="flex items-baseline gap-4 mb-6">
        <span className="text-3xl sm:text-4xl font-bold text-terracotta">
          ₹{(activePrice / 100).toLocaleString('en-IN')}
        </span>
        {!selectedVariant && product.salePrice && product.salePrice < product.price && (
          <span className="text-xl text-charcoal/45 line-through">
            ₹{(originalPrice / 100).toLocaleString('en-IN')}
          </span>
        )}
        <span className="text-sm text-charcoal/60 font-medium">(Incl. of all taxes)</span>
      </div>

      {/* Variants with Animated Selection Pill */}
      {product.variants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-charcoal mb-3">Options & Dimensions</h3>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v: Variant) => {
              const isSelected = selectedVariant?.id === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`relative px-4 py-2.5 border rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    isSelected
                      ? 'border-terracotta bg-terracotta/10 text-terracotta shadow-sm'
                      : 'border-sand bg-white text-charcoal hover:border-terracotta/60'
                  }`}
                >
                  {v.name}: {v.value}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock & Main Actions Card */}
      <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-sand shadow-sm">
        <div className="mb-4">
          {activeStock > 0 ? (
            <span className="text-deep-olive font-semibold flex items-center gap-2 text-sm">
              <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-deep-olive animate-pulse" />
              In Stock & Ready to Ship
            </span>
          ) : (
            <span className="text-terracotta font-semibold flex items-center gap-2 text-sm">
              <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-terracotta" />
              Sold Out / Out of Stock
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {/* Morphing Add-to-Cart Button */}
          <button
            disabled={activeStock === 0 || cartLoading}
            onClick={() => void addToCart()}
            className={`flex-1 py-3.5 px-6 font-semibold rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] shadow-sm ${
              activeStock === 0
                ? 'bg-charcoal/20 text-charcoal/50 cursor-not-allowed'
                : justAdded
                ? 'bg-deep-olive text-white shadow-md'
                : 'bg-charcoal text-white hover:bg-deep-olive active:scale-[0.98]'
            }`}
          >
            {cartLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : justAdded ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Added to Cart!</span>
              </>
            ) : (
              <span>{activeStock === 0 ? 'Sold Out' : 'Add to Cart'}</span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={addToWishlist}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg border border-sand bg-white text-charcoal hover:border-terracotta hover:text-terracotta transition-colors min-h-[48px] min-w-[48px]"
            aria-label="Add to Wishlist"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        {cartMsg && (
          <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-deep-olive">
            {cartMsg}
          </p>
        )}
        {wishlistMsg && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm font-medium ${
              wishlistMsg.includes('Please log in') ? 'text-terracotta' : 'text-deep-olive'
            }`}
          >
            {wishlistMsg}
          </p>
        )}
      </div>

      {/* Pincode Delivery Check */}
      <div className="mb-8 p-5 bg-white/50 rounded-xl border border-sand">
        <h3 className="text-sm font-semibold text-charcoal mb-2">Check Delivery Pincode</h3>
        <form onSubmit={checkDelivery} className="flex gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit Pincode"
            aria-label="Enter 6-digit pincode to check delivery availability"
            className="flex-1 p-2.5 border border-sand rounded-lg text-sm bg-white focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 text-charcoal"
          />
          <button
            type="submit"
            disabled={deliveryStatus.loading}
            className="bg-sand/60 px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-sand transition-colors text-charcoal min-h-[44px]"
          >
            Check
          </button>
        </form>
        {deliveryStatus.msg && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-2.5 text-xs sm:text-sm font-medium ${
              deliveryStatus.error ? 'text-terracotta' : 'text-deep-olive'
            }`}
          >
            {deliveryStatus.msg}
          </p>
        )}
      </div>

      {/* Mobile Sticky Floating Buy Bar */}
      <AnimatePresence>
        {scrolledPast && (
          <m.div
            initial={reducedMotion ? { opacity: 0 } : { y: 100 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 100 }}
            transition={{ duration: 0.25, ease: MOTION_TOKENS.ease.out }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand p-3.5 sm:hidden shadow-2xl flex items-center justify-between gap-4"
          >
            <div>
              <span className="text-xs text-charcoal/60 block line-clamp-1">{product.title}</span>
              <span className="font-bold text-lg text-terracotta">
                ₹{(activePrice / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <button
              disabled={activeStock === 0 || cartLoading}
              onClick={() => void addToCart()}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm min-h-[44px] transition-colors ${
                activeStock === 0
                  ? 'bg-charcoal/20 text-charcoal/50 cursor-not-allowed'
                  : justAdded
                  ? 'bg-deep-olive text-white'
                  : 'bg-terracotta text-white hover:bg-charcoal active:scale-98'
              }`}
            >
              {justAdded ? '✓ Added' : activeStock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
