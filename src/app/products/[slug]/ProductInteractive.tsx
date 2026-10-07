'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import type { Product, ProductImage, Variant, Category } from '@prisma/client'

type ProductWithRelations = Product & {
  images: ProductImage[]
  variants: Variant[]
  category: Category
}

export function ProductInteractive({ product }: { product: ProductWithRelations }) {
  const { data: session } = useSession()
  const [activeImage, setActiveImage] = useState(product.images[0]?.url || '/images/mock1.jpg')
  const [selectedVariant, setSelectedVariant] = useState(product.variants.length > 0 ? product.variants[0] : null)
  
  // Pincode state
  const [pincode, setPincode] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState<{ loading: boolean, msg: string, error?: boolean }>({ loading: false, msg: '' })
  
  // Wishlist state
  const [wishlistMsg, setWishlistMsg] = useState('')

  const activePrice = selectedVariant ? (selectedVariant.price ?? product.price) : (product.salePrice ?? product.price)
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock
  const originalPrice = product.price

  async function checkDelivery(e: React.FormEvent) {
    e.preventDefault()
    if (!pincode || pincode.length !== 6) return setDeliveryStatus({ loading: false, msg: 'Invalid Pincode', error: true })
    
    setDeliveryStatus({ loading: true, msg: 'Checking...' })
    try {
      const res = await fetch(`/api/shiprocket/check-pincode?pincode=${pincode}&weight=${product.weightGrams}`)
      const data = await res.json()
      if (res.ok && data.available) {
        setDeliveryStatus({ loading: false, msg: `Delivery in ${product.processingDays + (data.etdDays || 3)} days. Cash on Delivery ${product.codAllowed && data.codAvailable ? 'Available' : 'Unavailable'}.`, error: false })
      } else {
        setDeliveryStatus({ loading: false, msg: 'Delivery not available to this pincode.', error: true })
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
        body: JSON.stringify({ productId: product.id })
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square bg-sand/20 rounded overflow-hidden group">
          <Image 
            src={activeImage} 
            alt={product.title} 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-125 transition-transform duration-300 ease-out cursor-zoom-in" 
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img: ProductImage) => (
              <button 
                key={img.id} 
                onClick={() => setActiveImage(img.url)}
                className={`relative w-20 h-20 flex-shrink-0 border-2 overflow-hidden ${activeImage === img.url ? 'border-terracotta' : 'border-transparent'}`}
              >
                <Image src={img.url} alt={img.altText || ''} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">{product.title}</h1>
        
        {product.isMadeToOrder && (
          <div className="mb-4 inline-flex">
            <span className="bg-deep-olive text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Made to Order</span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <span className="text-3xl font-bold text-terracotta">₹{(activePrice / 100).toLocaleString('en-IN')}</span>
          {!selectedVariant && product.salePrice && product.salePrice < product.price && (
            <span className="text-xl text-charcoal/50 line-through">₹{(originalPrice / 100).toLocaleString('en-IN')}</span>
          )}
          <span className="text-sm text-charcoal/60">(Incl. of all taxes)</span>
        </div>

        {/* Variants */}
        {product.variants.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-charcoal mb-3">Options</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v: Variant) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 border text-sm ${
                    selectedVariant?.id === v.id 
                      ? 'border-terracotta bg-terracotta/5 text-terracotta font-medium' 
                      : 'border-sand text-charcoal hover:border-terracotta'
                  }`}
                >
                  {v.name}: {v.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock & Actions */}
        <div className="mb-8 p-6 bg-sand/10 rounded border border-sand">
          <div className="mb-4">
            {activeStock > 0 ? (
              <span className="text-deep-olive font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-deep-olive"></div> In Stock
              </span>
            ) : (
              <span className="text-terracotta font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-terracotta"></div> Out of Stock
              </span>
            )}
          </div>
          
          <div className="flex gap-4">
            <button 
              disabled={activeStock === 0}
              className="flex-1 bg-charcoal text-white py-3 font-medium hover:bg-deep-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeStock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button 
              onClick={addToWishlist}
              className="w-12 h-12 flex items-center justify-center border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors"
              aria-label="Add to Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
          {wishlistMsg && <p className={`mt-2 text-sm ${wishlistMsg.includes('Please log in') ? 'text-terracotta' : 'text-deep-olive'}`}>{wishlistMsg}</p>}
        </div>

        {/* Pincode Check */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-charcoal mb-2">Check Delivery</h3>
          <form onSubmit={checkDelivery} className="flex gap-2">
            <input 
              type="text" 
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit Pincode" 
              className="flex-1 p-2 border border-sand rounded text-sm focus:outline-none focus:border-terracotta"
            />
            <button type="submit" disabled={deliveryStatus.loading} className="bg-sand/50 px-4 py-2 text-sm font-medium rounded hover:bg-sand transition-colors">
              Check
            </button>
          </form>
          {deliveryStatus.msg && (
            <p className={`mt-2 text-sm ${deliveryStatus.error ? 'text-terracotta' : 'text-deep-olive'}`}>
              {deliveryStatus.msg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
