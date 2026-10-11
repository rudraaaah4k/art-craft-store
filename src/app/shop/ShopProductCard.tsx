'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductImage } from '@prisma/client'
import { TiltCard, Reveal } from '@/lib/motion'

type ProductWithImages = Product & { images: ProductImage[] }

export function ShopProductCard({
  product,
  index = 0,
}: {
  product: ProductWithImages
  index?: number
}) {
  const imageUrl = product.images?.[0]?.url || '/images/mock1.jpg'
  const activePrice = product.salePrice ?? product.price
  const hasSale = product.salePrice && product.salePrice < product.price

  return (
    <Reveal delay={Math.min(index * 0.05, 0.3)}>
      <TiltCard>
        <Link
          href={`/products/${product.slug}`}
          className="group flex flex-col bg-white border border-sand/80 hover:border-terracotta/40 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative h-full"
        >
          {/* Image Container with Inner Parallax / Scale */}
          <div className="relative aspect-square w-full bg-sand/20 overflow-hidden">
            {hasSale && (
              <span className="absolute top-3 left-3 z-20 bg-terracotta text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                SALE
              </span>
            )}
            {product.isMadeToOrder && (
              <span className="absolute top-3 right-3 z-20 bg-deep-olive text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                Made to Order
              </span>
            )}

            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            />

            {/* Subtle Gradient Shadow Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Details */}
          <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors line-clamp-1">
                {product.title}
              </h2>
              {product.processingDays > 0 && (
                <p className="text-xs text-charcoal/50 mt-1">
                  Ready in {product.processingDays} days
                </p>
              )}
            </div>

            <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-sand/40">
              <div className="flex items-baseline gap-2">
                <span className="font-sans font-bold text-base sm:text-lg text-charcoal">
                  ₹{(activePrice / 100).toLocaleString('en-IN')}
                </span>
                {hasSale && (
                  <span className="text-xs text-charcoal/45 line-through">
                    ₹{(product.price / 100).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-terracotta opacity-0 group-hover:opacity-100 transition-opacity">
                View →
              </span>
            </div>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  )
}
