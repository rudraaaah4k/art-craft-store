import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { Product, ProductImage } from '@prisma/client'
import type { Metadata } from 'next'
import { ShopFilters } from './ShopFilters'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our full collection of handmade Indian art, paintings, handicrafts, and artisan goods. Filter by category, price, and availability.',
  alternates: { canonical: '/shop' },
}

export const dynamic = 'force-dynamic' // Ensure URL changes re-fetch data

export default async function ShopPage(
  props: {
    searchParams?: Promise<{
      q?: string
      category?: string
      minPrice?: string
      maxPrice?: string
      inStock?: string
      sort?: string
      page?: string
    }>
  }
) {
  const searchParams = await props.searchParams;
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
    // We should ideally check both price and salePrice, but for simplicity we check price
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice * 100 }), // stored in paise
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
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ])

  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Shop All</h1>
        <p className="text-charcoal/70">Showing {products.length} of {totalItems} products</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <ShopFilters categories={categories} />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16 bg-sand/10 rounded">
              <p className="text-lg text-charcoal/70 mb-4">No products found matching your criteria.</p>
              <Link href="/shop" className="text-terracotta hover:underline">Clear all filters</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1
                    // Very simple pagination link generation
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
                        className={`w-10 h-10 flex items-center justify-center border ${
                          p === page 
                            ? 'bg-terracotta text-white border-terracotta' 
                            : 'border-sand text-charcoal hover:border-terracotta'
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

type ProductWithImages = Product & { images: ProductImage[] }

function ProductCard({ product }: { product: ProductWithImages }) {
  const imageUrl = product.images?.[0]?.url || '/images/mock1.jpg'
  const price = product.salePrice || product.price
  
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden bg-sand/30">
        {product.salePrice && (
          <div className="absolute top-2 left-2 z-10 bg-terracotta text-white text-xs font-bold px-2 py-1">
            SALE
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 z-10 bg-charcoal text-white text-xs font-bold px-2 py-1">
            SOLD OUT
          </div>
        )}
        <Image 
          src={imageUrl} 
          alt={product.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <div>
        <h3 className="font-medium text-charcoal truncate">{product.title}</h3>
        <div className="flex gap-2 items-center mt-1">
          <span className="font-bold text-charcoal">₹{(price / 100).toLocaleString('en-IN')}</span>
          {product.salePrice && (
            <span className="text-sm text-charcoal/50 line-through">₹{(product.price / 100).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
