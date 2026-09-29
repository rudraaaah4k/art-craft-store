'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductImage } from '@prisma/client'

type WishlistProduct = Product & { images: ProductImage[] }

export function WishlistClient({ product }: { product: WishlistProduct }) {
  const [removed, setRemoved] = useState(false)

  async function remove() {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      if (res.ok) {
        setRemoved(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (removed) return null

  const imageUrl = product.images?.[0]?.url || '/images/mock1.jpg'
  const price = product.salePrice || product.price

  return (
    <div className="group flex flex-col gap-3 relative">
      <button 
        onClick={remove}
        className="absolute top-2 right-2 z-20 bg-white text-charcoal p-1.5 rounded-full shadow hover:bg-terracotta hover:text-white transition-colors"
        aria-label="Remove from wishlist"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-sand/30">
        <Image 
          src={imageUrl} 
          alt={product.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </Link>
      <div>
        <Link href={`/products/${product.slug}`} className="font-medium text-charcoal truncate hover:text-terracotta transition-colors block">
          {product.title}
        </Link>
        <div className="font-bold text-charcoal mt-1">₹{(price / 100).toLocaleString('en-IN')}</div>
      </div>
    </div>
  )
}
