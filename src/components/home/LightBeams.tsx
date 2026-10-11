'use client'

import * as THREE from 'three'

export function LightBeams() {
  // Beams placed along the path to simulate soft gallery lighting from high clerestory windows
  const beamConfigs = [
    { position: [-2.5, 3.2, -6], rotation: [0.3, 0.4, -0.2], scale: [1.8, 6, 1] },
    { position: [2.8, 3.5, -16], rotation: [0.25, -0.4, 0.2], scale: [2.0, 7, 1] },
    { position: [-2.0, 3.3, -26], rotation: [0.3, 0.35, -0.15], scale: [2.2, 7, 1] },
  ]

  return (
    <group>
      {beamConfigs.map((cfg, idx) => (
        <mesh
          key={idx}
          position={cfg.position as [number, number, number]}
          rotation={cfg.rotation as [number, number, number]}
          scale={cfg.scale as [number, number, number]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#FAF6F0"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
