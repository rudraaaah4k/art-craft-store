'use client'

import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraRigProps {
  progress: number
  quality: 'HIGH' | 'MEDIUM' | 'LOW'
}

export function CameraRig({ progress, quality }: CameraRigProps) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const smoothedProgress = useRef(progress)
  const currentLookAt = useRef(new THREE.Vector3(0, 1.8, -5))

  // 1. Define the continuous 3D CatmullRom gallery curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 1.8, 4),      // Chapter 1: Hero entrance
        new THREE.Vector3(-0.6, 1.9, -2),  // Approaching Left artwork 1
        new THREE.Vector3(0.8, 2.0, -8),   // Pan towards Right artwork 2
        new THREE.Vector3(-0.5, 1.8, -15), // Meander towards center-left
        new THREE.Vector3(0.6, 2.1, -22),  // Approaching Right featured pieces
        new THREE.Vector3(0, 1.9, -29),    // Grand focal vista at the end of the hall
      ],
      false,
      'centripetal',
      0.3
    )
  }, [])

  // 2. Mouse parallax listener on HIGH tier only
  useEffect(() => {
    if (quality !== 'HIGH') return

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 0.3
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [quality])

  useFrame((_, delta) => {
    // Lerp progress for ultra-smooth motion
    const lerpSpeed = Math.min(delta * 4, 0.2)
    smoothedProgress.current = THREE.MathUtils.lerp(
      smoothedProgress.current,
      progress,
      lerpSpeed
    )

    const t = Math.max(0, Math.min(0.999, smoothedProgress.current))

    // Position along the 3D spline
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)

    // Calculate target lookAt point ahead on the curve
    const lookAheadT = Math.min(0.999, t + 0.06)
    const aheadPoint = curve.getPointAt(lookAheadT)

    // Apply mouse parallax to camera position on HIGH tier
    const targetCamX = point.x + (quality === 'HIGH' ? mouse.current.x * 0.5 : 0)
    const targetCamY = point.y + (quality === 'HIGH' ? -mouse.current.y * 0.3 : 0)
    const targetCamZ = point.z

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1)

    // Smooth camera lookAt
    currentLookAt.current.lerp(aheadPoint, 0.08)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
