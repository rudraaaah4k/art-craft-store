'use client'

import { useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { GalleryEnvironment } from './GalleryEnvironment'
import { FramedArtwork } from './FramedArtwork'
import { DustParticles } from './DustParticles'
import { LightBeams } from './LightBeams'
import type { HomeProduct } from './StaticFallback'

interface GalleryCanvasProps {
  products: HomeProduct[]
  progress: number
  quality: 'HIGH' | 'MEDIUM' | 'LOW'
  isVisible?: boolean
  isMobile?: boolean
}

export function GalleryCanvas({
  products,
  progress,
  quality,
  isVisible = true,
  isMobile = false,
}: GalleryCanvasProps) {
  // Distribute artworks along the gallery path
  const artworkLayouts = useMemo(() => {
    // Up to 12 positions along the gallery hall
    const positions: Array<{
      pos: [number, number, number]
      rot: [number, number, number]
      scale: [number, number, number]
      speed: number
    }> = [
      { pos: [-2.1, 1.9, -1.5], rot: [0, 0.35, 0], scale: [1, 1, 1], speed: 1.1 },
      { pos: [2.1, 2.1, -4.5], rot: [0, -0.32, 0], scale: [1.05, 1.05, 1], speed: 0.9 },
      { pos: [-2.3, 1.8, -8.0], rot: [0, 0.3, 0], scale: [0.95, 0.95, 1], speed: 1.2 },
      { pos: [2.2, 2.0, -11.5], rot: [0, -0.28, 0], scale: [1.1, 1.1, 1], speed: 0.8 },
      { pos: [-2.0, 2.2, -15.0], rot: [0, 0.32, 0], scale: [1, 1, 1], speed: 1.0 },
      { pos: [2.1, 1.85, -18.5], rot: [0, -0.3, 0], scale: [1.05, 1.05, 1], speed: 1.15 },
      { pos: [-2.2, 2.0, -22.0], rot: [0, 0.25, 0], scale: [1, 1, 1], speed: 0.95 },
      { pos: [2.0, 2.15, -25.5], rot: [0, -0.25, 0], scale: [1, 1, 1], speed: 1.05 },
      { pos: [0, 2.3, -30.0], rot: [0, 0, 0], scale: [1.25, 1.25, 1], speed: 0.8 },
      { pos: [-2.4, 2.0, -5.5], rot: [0, 0.2, 0], scale: [0.9, 0.9, 1], speed: 1.0 },
      { pos: [2.3, 1.9, -13.5], rot: [0, -0.22, 0], scale: [0.95, 0.95, 1], speed: 1.1 },
      { pos: [-2.1, 2.1, -27.5], rot: [0, 0.15, 0], scale: [1.0, 1.0, 1], speed: 0.9 },
    ]

    const count = quality === 'HIGH' ? Math.min(products.length, 12) : Math.min(products.length, 6)
    return products.slice(0, count).map((product, idx) => ({
      product,
      ...positions[idx % positions.length],
    }))
  }, [products, quality])

  // Canvas settings per tier & mobile rule
  const dpr: [number, number] = isMobile ? [1, 1.25] : quality === 'HIGH' ? [1, 2] : [1, 1.5]
  const antialias = !isMobile && quality === 'HIGH'
  const dustCount = quality === 'HIGH' ? 150 : 40

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 1.8, 4], fov: isMobile ? 65 : 55, near: 0.1, far: 50 }}
        dpr={dpr}
        gl={{
          antialias,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        frameloop={isVisible ? 'always' : 'never'}
        style={{ pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <CameraRig progress={progress} quality={quality} />
          <GalleryEnvironment quality={quality} />

          {/* Artworks */}
          {artworkLayouts.map((item, idx) => (
            <FramedArtwork
              key={item.product.id || idx}
              product={item.product}
              position={item.pos}
              rotation={item.rot}
              scale={item.scale}
              floatSpeed={item.speed}
              isMobile={isMobile}
            />
          ))}

          {/* Volumetric light beams on HIGH */}
          {quality === 'HIGH' && <LightBeams />}

          {/* Dust particles on HIGH and MEDIUM */}
          <DustParticles count={dustCount} />
        </Suspense>
      </Canvas>
    </div>
  )
}
