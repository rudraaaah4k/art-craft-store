import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Product, ProductImage } from '@prisma/client'

export const revalidate = 60

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    take: 3,
  })

  const featuredProducts = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    take: 4,
  })

  const newArrivals = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    take: 4,
  })

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full bg-charcoal overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-40">
          <Image 
            src="/images/mock1.jpg" 
            alt="Handmade Arts and Crafts" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-serif text-cream font-bold mb-4 drop-shadow-md">
            Discover Authentic Indian Craftsmanship
          </h1>
          <p className="text-lg md:text-xl text-sand mb-8 drop-shadow">
            Handcrafted paintings, digital art, and bespoke decor for your home.
          </p>
          <Link 
            href="/shop" 
            className="bg-terracotta text-white px-8 py-3 text-lg font-medium hover:bg-terracotta/90 transition-colors shadow-lg"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-charcoal mb-3">Shop by Category</h2>
          <div className="w-16 h-1 bg-terracotta mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link 
              key={cat.id} 
              href={`/shop?category=${cat.slug}`}
              className="group relative h-64 overflow-hidden bg-sand/30 block flex items-center justify-center"
            >
              <div className="absolute inset-0 opacity-20 group-hover:opacity-10 transition-opacity bg-charcoal z-10"></div>
              {/* Replace with real category images if available */}
              <Image 
                src={`/images/mock${i + 2}.jpg`}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-20 bg-white/90 backdrop-blur-sm px-6 py-3 shadow-sm border border-sand">
                <h3 className="font-serif text-xl font-bold text-charcoal">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-sand/20 py-12 rounded-lg">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-charcoal mb-3">Featured Artworks</h2>
            <div className="w-16 h-1 bg-terracotta"></div>
          </div>
          <Link href="/shop" className="text-terracotta font-medium hover:underline hidden sm:block">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="text-terracotta font-medium border border-terracotta px-6 py-2">View All Products</Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-charcoal mb-3">New Arrivals</h2>
          <div className="w-16 h-1 bg-terracotta mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-deep-olive text-cream py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-3">What Our Patrons Say</h2>
            <div className="w-16 h-1 bg-terracotta mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-charcoal/30 p-6 rounded border border-sand/10 relative">
                <div className="text-terracotta text-4xl font-serif absolute -top-4 left-6">&ldquo;</div>
                <p className="italic opacity-90 mb-4 pt-4">
                  &ldquo;The quality of the painting exceeded my expectations. The colors are vibrant and it completely transformed my living room space.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sand/20 flex items-center justify-center font-bold">
                    A{i}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Art Lover {i}</h4>
                    <p className="text-xs opacity-70">Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
        <Image 
          src={imageUrl} 
          alt={product.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
