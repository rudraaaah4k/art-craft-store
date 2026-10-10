'use client'

import {
  type ReactNode,
  useEffect,
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
} from 'react'
import {
  m,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  LazyMotion,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Lazy-load framer-motion domAnimation features                     */
/* ------------------------------------------------------------------ */
const loadFeatures = () =>
  import('framer-motion').then((mod) => mod.domAnimation)

/* ------------------------------------------------------------------ */
/*  Performance tier detection                                        */
/* ------------------------------------------------------------------ */
type Tier = 'high' | 'low'

function detectTier(): Tier {
  if (typeof navigator === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency ?? 8
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return cores <= 4 || mem <= 4 ? 'low' : 'high'
}

const TierContext = createContext<Tier>('high')

function useTier() {
  return useContext(TierContext)
}

/* ------------------------------------------------------------------ */
/*  Viewport hooks                                                    */
/* ------------------------------------------------------------------ */
function useIsMobile() {
  const [mobile, setMobile] = useState(true) // default mobile-first
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setMobile(!mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}

function useHasPointerFine() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return fine
}

/* ------------------------------------------------------------------ */
/*  MotionWrapper — LazyMotion + noscript fallback + tier context      */
/* ------------------------------------------------------------------ */
export function MotionWrapper({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>('high')

  useEffect(() => {
    setTier(detectTier())
  }, [])

  return (
    <TierContext.Provider value={tier}>
      <noscript>
        <style>{`.fm-el{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </TierContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  1. HeroAnimation — "gallery walk"                                  */
/*     - Scroll-driven scale+translateZ on desktop                     */
/*     - Simple fade+scale on mobile                                   */
/*     - Optional mouse parallax on desktop                            */
/*     - Optional gyroscope (tap-to-enable on iOS)                     */
/* ------------------------------------------------------------------ */
export function HeroAnimation({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const tier = useTier()
  const containerRef = useRef<HTMLDivElement>(null)

  /* ---- scroll tracking ---- */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  /* Desktop: large scale, fade out */
  const dScale = useTransform(scrollYProgress, [0, 0.7], [1, 2.5])
  const dZ = useTransform(scrollYProgress, [0, 0.7], [0, 300])
  const dOpacity = useTransform(scrollYProgress, [0.5, 0.85], [1, 0])

  /* Mobile: gentler scale + fade */
  const mScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.3])
  const mOpacity = useTransform(scrollYProgress, [0.4, 0.75], [1, 0])

  /* ---- mouse parallax (desktop only) ---- */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 120, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 25 })

  useEffect(() => {
    if (isMobile || reducedMotion || tier === 'low') return
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mouseX.set((e.clientX - cx) / cx * 15)   // ±15px
      mouseY.set((e.clientY - cy) / cy * 10)   // ±10px
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [isMobile, reducedMotion, tier, mouseX, mouseY])

  /* ---- gyroscope (opt-in via tap) ---- */
  const [gyroEnabled, setGyroEnabled] = useState(false)
  const gyroX = useMotionValue(0)
  const gyroY = useMotionValue(0)
  const springGyroX = useSpring(gyroX, { stiffness: 80, damping: 20 })
  const springGyroY = useSpring(gyroY, { stiffness: 80, damping: 20 })

  const requestGyro = useCallback(async () => {
    if (!isMobile || gyroEnabled) return
    /* iOS 13+ requires permission */
    const DEReq = (DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    })
    if (DEReq.requestPermission) {
      try {
        const perm = await DEReq.requestPermission()
        if (perm !== 'granted') return
      } catch {
        return
      }
    }
    setGyroEnabled(true)
  }, [isMobile, gyroEnabled])

  useEffect(() => {
    if (!gyroEnabled) return
    const handler = (e: DeviceOrientationEvent) => {
      const b = e.beta ?? 0   // front/back tilt
      const g = e.gamma ?? 0  // left/right tilt
      gyroX.set(g * 0.3)      // subtle
      gyroY.set(b * 0.3)
    }
    window.addEventListener('deviceorientation', handler, { passive: true } as AddEventListenerOptions)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [gyroEnabled, gyroX, gyroY])

  /* ---- reduced motion / low-end: static ---- */
  if (reducedMotion) {
    return <div>{children}</div>
  }

  const isLow = tier === 'low'
  const scale = isMobile ? mScale : isLow ? 1 : dScale
  const opacity = isMobile ? mOpacity : isLow ? dOpacity : dOpacity

  return (
    <div ref={containerRef} className="relative bg-charcoal" style={{ height: '140vh' }}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ perspective: 800 }}
      >
        <m.div
          style={{
            scale,
            opacity,
            translateZ: isMobile || isLow ? 0 : dZ,
            x: isMobile ? springGyroX : springX,
            y: isMobile ? springGyroY : springY,
            transformOrigin: 'center center',
          }}
          className="w-full h-full flex items-center justify-center fm-el"
        >
          {children}
        </m.div>
      </div>
      {/* Gyroscope opt-in button (mobile only, not auto-prompted) */}
      {isMobile && !gyroEnabled && !isLow && (
        <button
          onClick={requestGyro}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-charcoal/70 backdrop-blur text-cream border border-sand/30 flex items-center justify-center text-lg"
          aria-label="Enable gyroscope tilt effect"
          style={{ touchAction: 'manipulation' }}
        >
          ⟲
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  2. CategoryAnimation — staggered depth fly-in, once                */
/* ------------------------------------------------------------------ */
export function CategoryAnimation({
  children,
  index,
}: {
  children: ReactNode
  index: number
}) {
  const reducedMotion = useReducedMotion()
  const tier = useTier()
  const isMobile = useIsMobile()

  if (reducedMotion) return <>{children}</>

  /* Low-end: simple fade only */
  if (tier === 'low') {
    return (
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="fm-el"
      >
        {children}
      </m.div>
    )
  }

  /* Mobile: fade + slide up */
  if (isMobile) {
    return (
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="fm-el"
      >
        {children}
      </m.div>
    )
  }

  /* Desktop: 3D depth fly-in */
  return (
    <m.div
      initial={{ opacity: 0, rotateX: 25, z: -120, y: 30 }}
      whileInView={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        type: 'spring',
        stiffness: 60,
        damping: 18,
      }}
      style={{ perspective: 900, transformStyle: 'preserve-3d' }}
      className="fm-el"
    >
      {children}
    </m.div>
  )
}

/* ------------------------------------------------------------------ */
/*  3. ProductCarousel — coverflow on mobile, grid+tilt on desktop      */
/* ------------------------------------------------------------------ */

/**
 * On mobile: horizontal scroll-snap carousel with 3D coverflow.
 * On desktop: renders children in the normal grid; hover tilt for
 * pointer:fine devices.
 */
export function ProductCarousel({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()

  /* On desktop, just pass children through (grid is on the page) */
  if (!isMobile) return <>{children}</>

  /* Mobile: horizontal scroll-snap container */
  return (
    <div
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4"
      style={{
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
      }}
    >
      {children}
    </div>
  )
}

export function ProductCard3D({
  children,
  index,
}: {
  children: ReactNode
  index: number
}) {
  const isMobile = useIsMobile()
  const hasPointer = useHasPointerFine()
  const reducedMotion = useReducedMotion()
  const tier = useTier()
  const ref = useRef<HTMLDivElement>(null)

  /* ---- mobile coverflow scroll tracking ---- */
  const x = useMotionValue(0)

  useEffect(() => {
    if (!isMobile || reducedMotion || tier === 'low') return
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return

    let raf: number
    const updatePosition = () => {
      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const parentCenter = parentRect.left + parentRect.width / 2
      const elCenter = elRect.left + elRect.width / 2
      const offset = (elCenter - parentCenter) / (parentRect.width / 2)
      x.set(offset)  // -1 to 1 range
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updatePosition)
    }

    parent.addEventListener('scroll', onScroll, { passive: true })
    updatePosition()
    return () => {
      parent.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [isMobile, reducedMotion, tier, x])

  const rotateY = useTransform(x, [-1, 0, 1], [35, 0, -35])
  const scale = useTransform(x, [-1, 0, 1], [0.85, 1, 0.85])

  if (reducedMotion) {
    if (isMobile) {
      return (
        <div className="min-w-[75vw] snap-center flex-shrink-0">
          {children}
        </div>
      )
    }
    return <>{children}</>
  }

  /* ---- mobile: coverflow card ---- */
  if (isMobile) {
    const isLow = tier === 'low'
    return (
      <m.div
        ref={ref}
        className="min-w-[75vw] snap-center flex-shrink-0 fm-el"
        style={{
          rotateY: isLow ? 0 : rotateY,
          scale: isLow ? 1 : scale,
          transformStyle: 'preserve-3d',
          perspective: 600,
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
      >
        {children}
      </m.div>
    )
  }

  /* ---- desktop: hover tilt (pointer:fine only) ---- */
  if (!hasPointer || tier === 'low') {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="fm-el"
      >
        {children}
      </m.div>
    )
  }

  return (
    <DesktopTiltCard index={index}>{children}</DesktopTiltCard>
  )
}

function DesktopTiltCard({
  children,
  index,
}: {
  children: ReactNode
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springRotX = useSpring(rotX, { stiffness: 200, damping: 25 })
  const springRotY = useSpring(rotY, { stiffness: 200, damping: 25 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      rotY.set(((e.clientX - cx) / (rect.width / 2)) * 8)
      rotX.set(((cy - e.clientY) / (rect.height / 2)) * 8)
    },
    [rotX, rotY],
  )

  const handleMouseLeave = useCallback(() => {
    rotX.set(0)
    rotY.set(0)
  }, [rotX, rotY])

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformStyle: 'preserve-3d',
        perspective: 600,
      }}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="fm-el will-change-transform"
    >
      {children}
    </m.div>
  )
}
