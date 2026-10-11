import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import { ShopFilters } from './ShopFilters'
import { ShopProductCard } from './ShopProductCard'

export const metadata: Metadata = {
  title: 'Shop All Products | Handcrafted Indian Art & Decor',
  description:
    'Browse our full collection of handmade Indian art, paintings, handicrafts, and artisan goods. Filter by category, price, and availability.',
  alternates: { canonical: '/shop' },
}

export const dynamic = 'force-dynamic'

export default async function ShopPage(props: {
  searchParams?: Promise<{
    q?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    sort?: string
    page?: string
  }>
}) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  const category = searchParams?.category || ''
  const minPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice) : undefined
  const maxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice) : undefined
  const inStock = searchParams?.inStock === 'true'
  const sort = searchParams?.sort || 'newest'
  const page = parseInt(searchParams?.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    status: 'PUBLISHED',
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = { slug: category }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice * 100 }),
      ...(maxPrice !== undefined && { lte: maxPrice * 100 }),
    }
  }

  if (inStock) {
    where.stock = { gt: 0 }
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }

  const [products, totalItems, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header Banner */}
      <div className="mb-10 pb-6 border-b border-sand">
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-charcoal mb-3 tracking-tight">
          Shop Collection
        </h1>
        <p className="text-charcoal/70 text-base sm:text-lg">
          Showing {products.length} of {totalItems} handcrafted masterworks
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
          <ShopFilters categories={categories} />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white/60 border border-sand rounded-2xl shadow-sm px-6">
              <div className="w-16 h-16 mx-auto mb-4 text-terracotta bg-terracotta/10 rounded-full flex items-center justify-center font-serif text-2xl">
                🎨
              </div>
              <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">No artworks found</h2>
              <p className="text-charcoal/70 mb-6 max-w-md mx-auto">
                No items match your selected filters. Try broadening your criteria or reset the search.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-terracotta text-white rounded-lg font-medium hover:bg-charcoal transition-colors"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.map((prod, idx) => (
                  <ShopProductCard key={prod.id} product={prod} index={idx} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-14 flex justify-center items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1
                    const url = new URLSearchParams()
                    if (q) url.set('q', q)
                    if (category) url.set('category', category)
                    if (minPrice) url.set('minPrice', minPrice.toString())
                    if (maxPrice) url.set('maxPrice', maxPrice.toString())
                    if (inStock) url.set('inStock', 'true')
                    if (sort !== 'newest') url.set('sort', sort)
                    url.set('page', p.toString())

                    return (
                      <Link
                        key={p}
                        href={`/shop?${url.toString()}`}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-terracotta text-white border-terracotta shadow-sm'
                            : 'border-sand bg-white text-charcoal hover:border-terracotta'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
