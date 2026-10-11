'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { HomeProduct } from './StaticFallback'

interface ChapterOverlaysProps {
  products: HomeProduct[]
  categories: { id: string; name: string; slug: string }[]
}

export function ChapterOverlays({ products, categories }: ChapterOverlaysProps) {
  const spotlightProduct = products[0]
  const newArrivals = products.slice(1, 5)

  return (
    <div className="relative z-10 w-full pointer-events-none text-[#2B2B2B]">
      {/* ─── Chapter 1: Hero Entrance (0% - 20% scroll) ─── */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-[#FAF6F0]/85 backdrop-blur-md p-8 sm:p-12 rounded-2xl border border-[#E8DCC8] shadow-xl pointer-events-auto max-w-2xl">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#C4622D] mb-3 block">
            Handmade in India
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2B2B2B] leading-tight mb-4">
            A Living Gallery of Craft
          </h1>
          <p className="text-base sm:text-lg text-[#2B2B2B]/85 font-sans mb-8">
            Scroll down to wander through our curated corridors of authentic paintings, handcrafted decor, and masterworks.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-[#C4622D] text-white font-medium hover:bg-[#A85324] transition-colors rounded-lg shadow-md"
            >
              Shop Collection
            </Link>
            <Link
              href="#chapter-story"
              className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-[#FAF6F0] text-[#2B2B2B] border border-[#2B2B2B]/20 hover:border-[#2B2B2B] font-medium transition-colors rounded-lg"
            >
              Begin Journey ↓
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Chapter 2: Every Piece Tells a Story (25% - 45% scroll) ─── */}
      <section id="chapter-story" className="min-h-screen flex items-center justify-start px-6 sm:px-12 max-w-6xl mx-auto py-24">
        <div className="w-full sm:max-w-md bg-[#FAF6F0]/90 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-[#E8DCC8] shadow-lg pointer-events-auto">
          <span className="text-xs uppercase tracking-wider text-[#4A5D3A] font-bold block mb-2">
            Curator’s Selection
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#2B2B2B] mb-3">
            Every Piece Tells a Story
          </h2>
          <p className="text-sm sm:text-base text-[#2B2B2B]/80 mb-6">
            Crafted with natural mineral pigments, teakwood framing, and generations of ancestral mastery from Indian artisan ateliers.
          </p>

          {spotlightProduct && (
            <div className="bg-white/80 p-4 rounded-lg border border-[#E8DCC8] mb-6">
              <span className="text-xs text-[#C4622D] font-bold block mb-1">
                Spotlighted Artwork
              </span>
              <h3 className="font-serif font-semibold text-lg text-[#2B2B2B]">
                {spotlightProduct.title}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-[#2B2B2B]">
                  ₹{((spotlightProduct.salePrice ?? spotlightProduct.price) / 100).toLocaleString('en-IN')}
                </span>
                <Link
                  href={`/products/${spotlightProduct.slug}`}
                  className="text-xs font-semibold text-[#C4622D] hover:underline flex items-center gap-1 min-h-[44px] px-2"
                >
                  View Details →
                </Link>
              </div>
            </div>
          )}

          <Link
            href="/shop"
            className="inline-flex items-center justify-center min-h-[44px] w-full py-2.5 bg-[#2B2B2B] text-white text-sm font-medium hover:bg-[#4A5D3A] transition-colors rounded"
          >
            Explore Stories & Art
          </Link>
        </div>
      </section>

      {/* ─── Chapter 3: Colour, Texture, Soul (50% - 70% scroll) ─── */}
      <section className="min-h-screen flex items-center justify-end px-6 sm:px-12 max-w-6xl mx-auto py-24">
        <div className="w-full sm:max-w-lg bg-[#FAF6F0]/90 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-[#E8DCC8] shadow-lg pointer-events-auto">
          <span className="text-xs uppercase tracking-wider text-[#C4622D] font-bold block mb-2">
            Craft Disciplines
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#2B2B2B] mb-3">
            Colour, Texture, Soul
          </h2>
          <p className="text-sm sm:text-base text-[#2B2B2B]/80 mb-6">
            From intricate miniature Madhubani motifs to textured modern canvas reliefs and hand-cast bronze.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="flex items-center justify-between p-3 bg-white/80 border border-[#E8DCC8] rounded hover:border-[#C4622D] transition-colors group min-h-[44px]"
              >
                <span className="font-serif text-sm font-medium text-[#2B2B2B] group-hover:text-[#C4622D]">
                  {cat.name}
                </span>
                <span className="text-xs text-[#2B2B2B]/50 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center min-h-[44px] w-full py-2.5 border border-[#2B2B2B] text-[#2B2B2B] text-sm font-medium hover:bg-[#2B2B2B] hover:text-white transition-colors rounded"
          >
            View All Categories
          </Link>
        </div>
      </section>

      {/* ─── Chapter 4: New This Week (75% - 90% scroll) ─── */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 max-w-5xl mx-auto py-24">
        <div className="w-full bg-[#FAF6F0]/92 backdrop-blur-md p-6 sm:p-10 rounded-2xl border border-[#E8DCC8] shadow-xl pointer-events-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E8DCC8]">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#4A5D3A] font-bold">Fresh from the studio</span>
              <h2 className="text-3xl font-serif font-bold text-[#2B2B2B] mt-1">New This Week</h2>
            </div>
            <Link
              href="/shop"
              className="mt-3 sm:mt-0 text-sm font-medium text-[#C4622D] hover:underline flex items-center min-h-[44px]"
            >
              View all 20+ arrivals →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group bg-white p-3 rounded-lg border border-[#E8DCC8] hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative aspect-square w-full rounded overflow-hidden bg-[#FAF6F0] mb-3">
                  <Image
                    src={item.images?.[0]?.url || '/images/mock1.jpg'}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-serif text-sm font-medium text-[#2B2B2B] group-hover:text-[#C4622D] transition-colors truncate">
                  {item.title}
                </h3>
                <span className="text-xs font-bold text-[#2B2B2B] mt-1">
                  ₹{((item.salePrice ?? item.price) / 100).toLocaleString('en-IN')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Chapter 5: Grand Finale & Call to Action (90% - 100% scroll) ─── */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 max-w-4xl mx-auto py-24">
        <div className="bg-[#4A5D3A] text-[#FAF6F0] p-8 sm:p-12 rounded-2xl shadow-2xl pointer-events-auto max-w-2xl border border-[#FAF6F0]/20">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#E8DCC8] mb-3 block">
            Bring Art into Your Sanctum
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4">
            Explore the Complete Collection
          </h2>
          <p className="text-base sm:text-lg text-[#FAF6F0]/90 mb-8 font-sans">
            Every purchase directly sustains traditional Indian artisans and preserves heritage crafts for future generations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-[#C4622D] text-white font-medium hover:bg-[#A85324] transition-colors rounded shadow-lg"
            >
              Shop All Artworks
            </Link>
            <Link
              href="/custom-orders"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white/10 hover:bg-white/20 text-[#FAF6F0] border border-white/30 font-medium transition-colors rounded"
            >
              Custom Commissions
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Accessible Screen-Reader & SEO Product Index ─── */}
      <div className="sr-only">
        <h2>All Featured Artworks in Exhibition</h2>
        <ul>
          {products.map((p) => (
            <li key={`sr-${p.id}`}>
              <Link href={`/products/${p.slug}`}>
                {p.title} - ₹{((p.salePrice ?? p.price) / 100).toLocaleString('en-IN')}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
