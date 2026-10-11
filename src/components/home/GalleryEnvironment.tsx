'use client'

import * as THREE from 'three'

interface GalleryEnvironmentProps {
  quality: 'HIGH' | 'MEDIUM' | 'LOW'
}

export function GalleryEnvironment({ quality }: GalleryEnvironmentProps) {
  return (
    <group>
      {/* ─── Ambient & Directional Lights ─── */}
      <ambientLight intensity={0.85} color="#FAF6F0" />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        color="#FFF9F2"
      />
      <directionalLight
        position={[-6, 6, -15]}
        intensity={0.6}
        color="#E8DCC8"
      />
      <pointLight
        position={[0, 4, -8]}
        intensity={0.4}
        color="#C4622D"
        distance={18}
      />

      {/* ─── Main Gallery Floor ─── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -18]}
      >
        <planeGeometry args={[16, 50]} />
        <meshStandardMaterial
          color="#FAF6F0"
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* ─── Fake Floor Reflection (soft blurred mirrored plane on HIGH) ─── */}
      {quality === 'HIGH' && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, -18]}
        >
          <planeGeometry args={[12, 48]} />
          <meshBasicMaterial
            color="#E8DCC8"
            transparent
            opacity={0.15}
            blending={THREE.NormalBlending}
          />
        </mesh>
      )}

      {/* ─── Gallery Pillars / Architecture Accents (low-poly clean geometry) ─── */}
      {/* Left Pillars */}
      {[-4, -12, -20, -28].map((z, idx) => (
        <group key={`pillar-l-${idx}`} position={[-4.2, 2.5, z]}>
          <mesh>
            <boxGeometry args={[0.6, 5, 0.6]} />
            <meshStandardMaterial
              color="#FAF6F0"
              roughness={0.7}
            />
          </mesh>
          {/* Subtle terracotta capital/trim */}
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.7]} />
            <meshStandardMaterial
              color="#E8DCC8"
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* Right Pillars */}
      {[-4, -12, -20, -28].map((z, idx) => (
        <group key={`pillar-r-${idx}`} position={[4.2, 2.5, z]}>
          <mesh>
            <boxGeometry args={[0.6, 5, 0.6]} />
            <meshStandardMaterial
              color="#FAF6F0"
              roughness={0.7}
            />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.7]} />
            <meshStandardMaterial
              color="#E8DCC8"
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* ─── End Wall with warm arch gateway ─── */}
      <group position={[0, 2.5, -34]}>
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[3, 5, 0.4]} />
          <meshStandardMaterial color="#FAF6F0" roughness={0.8} />
        </mesh>
        <mesh position={[3, 0, 0]}>
          <boxGeometry args={[3, 5, 0.4]} />
          <meshStandardMaterial color="#FAF6F0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[3, 0.8, 0.4]} />
          <meshStandardMaterial color="#FAF6F0" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
