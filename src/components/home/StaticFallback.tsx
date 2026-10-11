import Image from 'next/image'
import Link from 'next/link'

export interface HomeProduct {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  images: { url: string; altText?: string | null }[]
  category?: { name: string; slug: string } | null
}

interface StaticFallbackProps {
  products: HomeProduct[]
  categories?: { id: string; name: string; slug: string }[]
}

export function StaticFallback({ products, categories = [] }: StaticFallbackProps) {
  return (
    <div className="w-full bg-[#FAF6F0] text-[#2B2B2B] flex flex-col gap-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Chapter 1: Hero */}
      <section className="text-center py-16 md:py-24 max-w-3xl mx-auto">
        <span className="text-sm font-semibold tracking-widest uppercase text-[#C4622D] mb-3 block">
          Handcrafted in India
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2B2B2B] leading-tight mb-6">
          A Living Gallery of Authentic Indian Art & Craft
        </h1>
        <p className="text-lg md:text-xl text-[#2B2B2B]/80 font-sans mb-8">
          Step into our curated sanctum of handcrafted paintings, terracotta artifacts, and bespoke decor made by master artisans.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-[#C4622D] text-white font-medium hover:bg-[#A85324] transition-colors rounded shadow-sm"
          >
            Explore Collection
          </Link>
          <Link
            href="/custom-orders"
            className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-transparent text-[#2B2B2B] border border-[#2B2B2B]/30 hover:border-[#2B2B2B] font-medium transition-colors rounded"
          >
            Custom Orders
          </Link>
        </div>
      </section>

      {/* Chapter 2: Featured Gallery Grid */}
      <section className="py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E8DCC8]">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#4A5D3A] font-bold">Curated Selection</span>
            <h2 className="text-3xl font-serif font-bold text-[#2B2B2B] mt-1">Featured Artworks</h2>
          </div>
          <Link
            href="/shop"
            className="mt-4 md:mt-0 text-[#C4622D] hover:text-[#A85324] font-medium text-sm flex items-center gap-1 group"
          >
            <span>View all items</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => {
            const img = product.images?.[0]?.url || '/images/mock1.jpg'
            const activePrice = product.salePrice ?? product.price
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col bg-white border border-[#E8DCC8] rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square w-full bg-[#FAF6F0] overflow-hidden">
                  <Image
                    src={img}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.salePrice && (
                    <span className="absolute top-2 left-2 bg-[#C4622D] text-white text-xs font-semibold px-2 py-0.5 rounded">
                      SALE
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    {product.category && (
                      <span className="text-xs text-[#4A5D3A] font-medium uppercase tracking-wider block mb-1">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="font-serif text-base font-semibold text-[#2B2B2B] group-hover:text-[#C4622D] transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-sans font-bold text-[#2B2B2B]">
                      ₹{(activePrice / 100).toLocaleString('en-IN')}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs text-[#2B2B2B]/50 line-through">
                        ₹{(product.price / 100).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Chapter 3: Categories if available */}
      {categories.length > 0 && (
        <section className="py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#2B2B2B]">Shop by Craft Discipline</h2>
            <p className="text-sm text-[#2B2B2B]/70 mt-2">Discover masterpieces by technique and material</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-48 sm:h-56 rounded overflow-hidden border border-[#E8DCC8] flex items-end p-6 bg-[#2B2B2B]/10 hover:shadow-lg transition-all"
              >
                <Image
                  src={`/images/mock${(idx % 4) + 1}.jpg`}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-95"
                />
                <div className="relative z-10 bg-white/95 backdrop-blur-sm px-4 py-2 border border-[#E8DCC8] rounded">
                  <h3 className="font-serif text-lg font-bold text-[#2B2B2B] group-hover:text-[#C4622D] transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Chapter 4: CTA */}
      <section className="bg-[#4A5D3A] text-[#FAF6F0] rounded-xl p-8 md:p-12 text-center my-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Commission a Unique Artwork</h2>
        <p className="max-w-xl mx-auto text-[#FAF6F0]/90 mb-6 font-sans">
          Work directly with traditional Indian artisans for tailored dimensions, specific palettes, and custom concepts.
        </p>
        <Link
          href="/custom-orders"
          className="inline-block min-h-[44px] px-8 py-3 bg-[#C4622D] text-white font-medium hover:bg-[#A85324] transition-colors rounded shadow"
        >
          Request Custom Commission
        </Link>
      </section>
    </div>
  )
}
