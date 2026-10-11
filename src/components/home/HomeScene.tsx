'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQuality, useReducedMotion } from '@/lib/motion'
import { StaticFallback, type HomeProduct } from './StaticFallback'
import { ChapterOverlays } from './ChapterOverlays'
import { useScrollProgress } from './useScrollProgress'
import { useVisibility } from './useVisibility'

// Dynamically load GalleryCanvas strictly with ssr: false as instructed by 3D rules
const GalleryCanvas = dynamic(
  () => import('./GalleryCanvas').then((mod) => mod.GalleryCanvas),
  { ssr: false }
)

interface HomeSceneProps {
  products: HomeProduct[]
  categories: { id: string; name: string; slug: string }[]
}

export function HomeScene({ products, categories }: HomeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quality = useQuality()
  const reducedMotion = useReducedMotion()
  const progress = useScrollProgress(containerRef)
  const isVisible = useVisibility(containerRef)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // If client prefers reduced motion or quality is LOW, render static fallback (zero 3D bundle cost / no WebGL)
  if (reducedMotion || (mounted && quality === 'LOW')) {
    return <StaticFallback products={products} categories={categories} />
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#FAF6F0] selection:bg-[#C4622D] selection:text-white"
    >
      {/* ─── Fixed 3D Canvas Background ─── */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        {mounted && (
          <GalleryCanvas
            products={products}
            progress={progress}
            quality={quality}
            isVisible={isVisible}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* ─── Scrollable Chapters Overlaid on Canvas ─── */}
      <div className="relative -mt-[100vh] z-10">
        <ChapterOverlays products={products} categories={categories} />
      </div>
    </div>
  )
}
