'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@prisma/client'
import { m, AnimatePresence } from 'framer-motion'
import { useReducedMotion, MOTION_TOKENS } from '@/lib/motion'

export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const reducedMotion = useReducedMotion()
  const touchStartX = useRef(0)

  const activeImage = images[selectedIndex]?.url || images[0]?.url || '/images/mock1.jpg'

  // Drag / swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40 && images.length > 1) {
      if (diff > 0) {
        // Swipe left -> next image
        setSelectedIndex((prev) => (prev + 1) % images.length)
      } else {
        // Swipe right -> prev image
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
      }
    }
  }

  // Hover zoom coordinate calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Main 3D Perspective Stage */}
      <div
        className="relative aspect-square bg-sand/20 rounded-2xl overflow-hidden border border-sand/70 shadow-sm cursor-zoom-in"
        style={{ perspective: '1000px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <m.div
            key={activeImage}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: 8, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: MOTION_TOKENS.ease.out }}
            className="w-full h-full relative"
          >
            <Image
              src={activeImage}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-200 ease-out ${
                isZoomed && !reducedMotion ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed && !reducedMotion
                  ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : undefined
              }
            />
          </m.div>
        </AnimatePresence>

        {/* Swipe indicator dots on mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 sm:hidden bg-charcoal/40 backdrop-blur-md px-3 py-1.5 rounded-full">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === selectedIndex ? 'bg-cream w-4' : 'bg-cream/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
          {images.map((img: ProductImage, idx: number) => {
            const isSelected = selectedIndex === idx
            return (
              <button
                key={img.id}
                type="button"
                aria-label={`View image ${idx + 1} of ${images.length}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all min-h-[44px] min-w-[44px] ${
                  isSelected
                    ? 'border-terracotta shadow-md scale-102 ring-2 ring-terracotta/20'
                    : 'border-sand/70 hover:border-sand opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || ''}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
