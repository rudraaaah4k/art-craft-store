'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent } from 'react'
import type { Category } from '@prisma/client'

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentQ = searchParams.get('q') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentInStock = searchParams.get('inStock') === 'true'
  const currentSort = searchParams.get('sort') || 'newest'

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const url = new URLSearchParams()
    
    if (currentQ) url.set('q', currentQ)
    
    const cat = fd.get('category') as string
    if (cat) url.set('category', cat)
    
    const minP = fd.get('minPrice') as string
    if (minP) url.set('minPrice', minP)
    
    const maxP = fd.get('maxPrice') as string
    if (maxP) url.set('maxPrice', maxP)
    
    const inS = fd.get('inStock') as string
    if (inS) url.set('inStock', 'true')
    
    const srt = fd.get('sort') as string
    if (srt && srt !== 'newest') url.set('sort', srt)
    
    router.push(`/shop?${url.toString()}`)
  }

  function handleClear() {
    if (currentQ) {
      router.push(`/shop?q=${currentQ}`)
    } else {
      router.push('/shop')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-sand/10 p-4 border border-sand rounded space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold font-serif text-lg">Filters</h2>
        <button type="button" onClick={handleClear} className="text-xs text-terracotta hover:underline">Clear All</button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select name="category" defaultValue={currentCategory} className="w-full p-2 border border-sand bg-white rounded text-sm focus:outline-none focus:border-terracotta">
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input type="number" name="minPrice" placeholder="Min" defaultValue={currentMinPrice} className="w-full p-2 border border-sand bg-white rounded text-sm focus:outline-none focus:border-terracotta" />
          <span>-</span>
          <input type="number" name="maxPrice" placeholder="Max" defaultValue={currentMaxPrice} className="w-full p-2 border border-sand bg-white rounded text-sm focus:outline-none focus:border-terracotta" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="inStock" value="true" defaultChecked={currentInStock} className="accent-terracotta w-4 h-4" />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      <div className="pt-4 border-t border-sand/50">
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <select name="sort" defaultValue={currentSort} className="w-full p-2 border border-sand bg-white rounded text-sm focus:outline-none focus:border-terracotta">
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <button type="submit" className="w-full bg-charcoal text-white py-2 font-medium hover:bg-deep-olive transition-colors">
        Apply Filters
      </button>
    </form>
  )
}
