/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import {
  m,
  useReducedMotion as useFramerReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  LazyMotion
} from 'framer-motion'
import Lenis from 'lenis'

const loadFeatures = () => import('framer-motion').then(res => res.domAnimation)

// --- 1. Quality & Reduced Motion Hooks ---

export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW'

export function useQuality(): QualityTier {
  const [tier, setTier] = useState<QualityTier>('HIGH')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const nav = navigator as any
    const hardwareConcurrency = nav.hardwareConcurrency || 8
    const deviceMemory = nav.deviceMemory || 8
    const saveData = nav.connection?.saveData || false
    
    // Simple WebGL check
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (hardwareConcurrency <= 4 || deviceMemory <= 4 || saveData || !gl) {
      setTier('LOW')
    } else if (hardwareConcurrency <= 6 || window.innerWidth < 768) {
      setTier('MEDIUM')
    } else {
      setTier('HIGH')
    }
  }, [])

  return tier
}

export function useReducedMotion() {
  return useFramerReducedMotion()
}

// --- 2. Shared Easing/Spring Tokens ---

export const MOTION_TOKENS = {
  spring: {
    stiff: { type: 'spring', stiffness: 300, damping: 25 },
    gentle: { type: 'spring', stiffness: 100, damping: 20 },
    bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  },
  ease: {
    out: [0.33, 1, 0.68, 1] as [number, number, number, number],
    inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  },
}

// --- 3. Lenis Provider ---

export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  
  useEffect(() => {
    if (reducedMotion) return
    
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [reducedMotion])

  return <>{children}</>
}

// --- 4. Page Transition Wrapper ---

export function PageTransition({ children, route }: { children: ReactNode; route: string }) {
  const reducedMotion = useReducedMotion()
  
  const isExcluded = ['/admin', '/checkout', '/cart', '/account'].some(r => route.startsWith(r))

  if (isExcluded || reducedMotion) {
    return <>{children}</>
  }

  return (
    <LazyMotion features={loadFeatures} strict>
      <AnimatePresence mode="wait">
        <m.div
          key={route}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: MOTION_TOKENS.ease.out }}
          className="w-full h-full"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}

// --- 5. UI Components ---

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return <>{children}</>

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: MOTION_TOKENS.ease.out }}
      className="fm-el"
    >
      {children}
    </m.div>
  )
}

export function Parallax({ children, speed = 1 }: { children: ReactNode; speed?: number }) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [50 * speed, -50 * speed])
  const springY = useSpring(y, MOTION_TOKENS.spring.gentle)

  if (reducedMotion) return <>{children}</>

  return (
    <m.div ref={ref} style={{ y: springY }} className="fm-el">
      {children}
    </m.div>
  )
}

export function TiltCard({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  
  // Use pointer:fine detection
  const [hasPointer, setHasPointer] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    setHasPointer(mq.matches)
  }, [])

  if (reducedMotion || !hasPointer) return <>{children}</>

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -10
    const rotY = ((x - cx) / cx) * 10
    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s ease-out' }}
      className="fm-el"
    >
      {children}
    </div>
  )
}

export function MagneticButton({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  
  const [hasPointer, setHasPointer] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    setHasPointer(mq.matches)
  }, [])

  if (reducedMotion || !hasPointer) return <>{children}</>

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = `translate(0px, 0px)`
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)' }}
      className="inline-block fm-el cursor-pointer"
    >
      {children}
    </div>
  )
}

export function SplitText({ text, delay = 0 }: { text: string; delay?: number }) {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return <span>{text}</span>

  const words = text.split(' ')
  
  return (
    <span className="inline-block">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <m.span
            className="inline-block fm-el"
            initial={{ y: '100%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.5, 
              delay: delay + i * 0.05, 
              ease: MOTION_TOKENS.ease.out 
            }}
          >
            {word}
          </m.span>
        </span>
      ))}
    </span>
  )
}

export function ScrollProgress() {
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  
  if (reducedMotion) return null

  return (
    <m.div
      className="fixed top-0 left-0 right-0 h-1 bg-terracotta origin-left z-50 fm-el"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

