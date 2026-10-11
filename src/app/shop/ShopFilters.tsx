'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useState } from 'react'
import type { Category } from '@prisma/client'
import { m, AnimatePresence } from 'framer-motion'
import { MOTION_TOKENS, useReducedMotion } from '@/lib/motion'

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  const currentQ = searchParams.get('q') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentInStock = searchParams.get('inStock') === 'true'
  const currentSort = searchParams.get('sort') || 'newest'

  const activeFiltersCount = [
    Boolean(currentCategory),
    Boolean(currentMinPrice),
    Boolean(currentMaxPrice),
    currentInStock,
    currentSort !== 'newest',
  ].filter(Boolean).length

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      const url = new URLSearchParams()

      const q = fd.get('q') as string
      if (q) url.set('q', q)

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

      setMobileOpen(false)
      router.push(`/shop?${url.toString()}`)
    },
    [router]
  )

  const handleClear = useCallback(() => {
    setMobileOpen(false)
    router.push('/shop')
  }, [router])

  const formKey = `${currentCategory}|${currentMinPrice}|${currentMaxPrice}|${currentInStock}|${currentSort}`

  const filterFormContent = (
    <form
      onSubmit={handleSubmit}
      key={formKey}
      className="space-y-6"
    >
      <div className="flex justify-between items-center pb-3 border-b border-sand/60">
        <h2 className="font-bold font-serif text-lg text-charcoal">Filters & Sort</h2>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-terracotta hover:underline font-medium min-h-[44px] flex items-center px-1"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {currentQ && <input type="hidden" name="q" value={currentQ} />}

      <div>
        <label htmlFor="shop-category" className="block text-sm font-medium mb-2 text-charcoal">
          Category
        </label>
        <select
          id="shop-category"
          name="category"
          defaultValue={currentCategory}
          className="w-full p-2.5 border border-sand bg-white rounded-lg text-sm focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 text-charcoal"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-charcoal">
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            defaultValue={currentMinPrice}
            className="w-full p-2.5 border border-sand bg-white rounded-lg text-sm focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 text-charcoal"
            aria-label="Minimum price"
          />
          <span className="text-charcoal/40 font-bold">-</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            className="w-full p-2.5 border border-sand bg-white rounded-lg text-sm focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 text-charcoal"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer py-1">
          <input
            type="checkbox"
            name="inStock"
            value="true"
            defaultChecked={currentInStock}
            className="accent-terracotta w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-charcoal">In Stock Only</span>
        </label>
      </div>

      <div className="pt-4 border-t border-sand/60">
        <label htmlFor="shop-sort" className="block text-sm font-medium mb-2 text-charcoal">
          Sort By
        </label>
        <select
          id="shop-sort"
          name="sort"
          defaultValue={currentSort}
          className="w-full p-2.5 border border-sand bg-white rounded-lg text-sm focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 text-charcoal"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-charcoal text-white py-3 font-medium rounded-lg hover:bg-deep-olive transition-colors shadow-sm min-h-[44px] flex items-center justify-center text-sm"
      >
        Apply Filters
      </button>
    </form>
  )

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="md:hidden mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-sand rounded-full text-sm font-medium text-charcoal hover:border-terracotta shadow-sm min-h-[44px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-terracotta"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          <span>Filter & Sort</span>
          {activeFiltersCount > 0 && (
            <span className="bg-terracotta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-terracotta hover:underline font-medium min-h-[44px] flex items-center"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:block bg-white/70 backdrop-blur-sm p-6 border border-sand rounded-xl shadow-sm sticky top-24">
        {filterFormContent}
      </div>

      {/* Mobile Filter Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer */}
            <m.div
              initial={reducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: 0.28, ease: MOTION_TOKENS.ease.out }}
              className="relative z-10 bg-cream rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto border-t border-sand shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-1 bg-sand mx-auto rounded-full absolute top-2.5 left-1/2 -translate-x-1/2" />
                <span className="font-serif font-bold text-lg text-charcoal">Filter Catalog</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-charcoal p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-sand/30"
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>

              {filterFormContent}
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
