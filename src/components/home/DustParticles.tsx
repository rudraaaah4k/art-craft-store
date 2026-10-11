'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DustParticlesProps {
  count?: number
}

export function DustParticles({ count = 100 }: DustParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Spread across gallery hall volume: X [-6, 6], Y [0.5, 5], Z [-35, 5]
      pos[i * 3 + 0] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = Math.random() * 4.5 + 0.5
      pos[i * 3 + 2] = -Math.random() * 40 + 2

      spd[i * 3 + 0] = (Math.random() - 0.5) * 0.003
      spd[i * 3 + 1] = Math.random() * 0.002 + 0.001
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.003
    }

    return [pos, spd]
  }, [count])

  useFrame(() => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      array[i * 3 + 0] += speeds[i * 3 + 0]
      array[i * 3 + 1] += speeds[i * 3 + 1]
      array[i * 3 + 2] += speeds[i * 3 + 2]

      // Wrap boundaries
      if (array[i * 3 + 1] > 5) array[i * 3 + 1] = 0.5
      if (array[i * 3 + 0] > 6) array[i * 3 + 0] = -6
      if (array[i * 3 + 0] < -6) array[i * 3 + 0] = 6
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#E8DCC8"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
