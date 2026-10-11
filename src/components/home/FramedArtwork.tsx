'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import type { HomeProduct } from './StaticFallback'

interface FramedArtworkProps {
  product: HomeProduct
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  floatSpeed?: number
  floatIntensity?: number
  isMobile?: boolean
  onClick?: () => void
}

export function FramedArtwork({
  product,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  floatSpeed = 1.0,
  floatIntensity = 0.08,
  isMobile = false,
  onClick,
}: FramedArtworkProps) {
  const router = useRouter()
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  const initialY = position[1]
  const randomPhase = useRef(Math.random() * Math.PI * 2)

  // Load and clean up texture
  useEffect(() => {
    let active = true
    const loader = new THREE.TextureLoader()
    const imageUrl = product.images?.[0]?.url || '/images/mock1.jpg'

    loader.load(
      imageUrl,
      (tex) => {
        if (!active) {
          tex.dispose()
          return
        }
        tex.colorSpace = THREE.SRGBColorSpace
        tex.generateMipmaps = true
        tex.minFilter = THREE.LinearMipmapLinearFilter
        // Mobile constraint: max 512px texture size if supported or downscaled
        setTexture(tex)
      },
      undefined,
      () => {
        // Fallback procedural canvas texture on error
        if (!active) return
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#E8DCC8'
          ctx.fillRect(0, 0, 256, 256)
          ctx.fillStyle = '#C4622D'
          ctx.font = 'bold 20px serif'
          ctx.textAlign = 'center'
          ctx.fillText(product.title.slice(0, 16), 128, 128)
          const fallbackTex = new THREE.CanvasTexture(canvas)
          setTexture(fallbackTex)
        }
      }
    )

    return () => {
      active = false
      if (texture) {
        texture.dispose()
      }
    }
  }, [product.images, product.title])

  // Subtle floating animation
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    // Gentle bobbing
    groupRef.current.position.y =
      initialY + Math.sin(time * floatSpeed + randomPhase.current) * floatIntensity

    // Subtle hover scale lerp
    const targetScale = hovered ? 1.05 : 1.0
    groupRef.current.scale.lerp(
      new THREE.Vector3(scale[0] * targetScale, scale[1] * targetScale, scale[2] * targetScale),
      0.1
    )
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    } else {
      router.push(`/products/${product.slug}`)
    }
  }

  // Dimensions of artwork
  const width = 1.4
  const height = 1.8
  const frameThickness = 0.08
  const frameDepth = 0.1

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!isMobile) {
          document.body.style.cursor = 'pointer'
          setHovered(true)
        }
      }}
      onPointerOut={() => {
        if (!isMobile) {
          document.body.style.cursor = 'auto'
          setHovered(false)
        }
      }}
    >
      {/* ─── Outer Frame (Wood/Terracotta aesthetic) ─── */}
      <mesh position={[0, 0, -frameDepth / 2]}>
        <boxGeometry
          args={[width + frameThickness * 2, height + frameThickness * 2, frameDepth]}
        />
        <meshStandardMaterial
          color={hovered ? '#C4622D' : '#3D2F28'}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* ─── Inner Bevel / Matting ─── */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[width + 0.04, height + 0.04]} />
        <meshBasicMaterial color="#FAF6F0" />
      </mesh>

      {/* ─── The Artwork Canvas Surface ─── */}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#E8DCC8" roughness={0.9} />
        )}
      </mesh>

      {/* ─── Plaque with Title & Price below frame ─── */}
      <mesh position={[0, -height / 2 - frameThickness - 0.15, 0.02]}>
        <planeGeometry args={[width * 0.9, 0.22]} />
        <meshBasicMaterial
          color={hovered ? '#C4622D' : '#2B2B2B'}
          transparent
          opacity={hovered ? 0.95 : 0.75}
        />
      </mesh>
    </group>
  )
}
