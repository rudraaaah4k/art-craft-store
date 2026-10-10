'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion, useSpring, LazyMotion } from 'framer-motion'

const loadFeatures = () => import('framer-motion').then(res => res.domAnimation)

export function MotionWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <noscript>
        <style>{`
          .framer-motion-fallback { opacity: 1 !important; transform: none !important; }
        `}</style>
      </noscript>
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </>
  )
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  
  return isMobile
}

export function HeroAnimation({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  // Heavy 3D for desktop, subtle fade/slide for mobile/reduced motion
  // Scale up significantly so it feels like "walking through"
  const desktopScale = useTransform(scrollYProgress, [0, 0.8], [1, 4])
  const desktopOpacity = useTransform(scrollYProgress, [0.6, 0.9], [1, 0])
  
  const mobileY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const mobileOpacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0])

  const scale = (shouldReduceMotion || isMobile) ? 1 : desktopScale
  const y = (shouldReduceMotion || isMobile) ? mobileY : 0
  const opacity = (shouldReduceMotion || isMobile) ? mobileOpacity : desktopOpacity

  return (
    <div ref={containerRef} className="relative h-[150vh] bg-charcoal">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center perspective-[1000px]">
        <m.div
          style={{ 
            scale, 
            y, 
            opacity,
            transformOrigin: 'center center'
          }}
          className="w-full h-full flex items-center justify-center framer-motion-fallback"
        >
          {children}
        </m.div>
      </div>
    </div>
  )
}

export function CategoryAnimation({ children, index }: { children: ReactNode; index: number }) {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  
  if (shouldReduceMotion) {
    return <>{children}</>
  }

  if (isMobile) {
    return (
      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="framer-motion-fallback"
      >
        {children}
      </m.div>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, rotateX: 20, z: -100 }}
      whileInView={{ opacity: 1, rotateX: 0, z: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        type: "spring",
        stiffness: 50,
        damping: 15
      }}
      style={{ perspective: 1000 }}
      className="framer-motion-fallback"
    >
      {children}
    </m.div>
  )
}

export function ProductAnimation({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Subtle parallax Y movement on scroll
  const yParallax = useTransform(scrollYProgress, [0, 1], [50, -50])
  const springY = useSpring(yParallax, { stiffness: 100, damping: 30 })

  if (shouldReduceMotion) {
    return <>{children}</>
  }

  if (isMobile) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="framer-motion-fallback"
      >
        {children}
      </m.div>
    )
  }

  return (
    <m.div
      ref={ref}
      style={{ y: springY }}
      whileHover={{ 
        y: -10, 
        rotateX: 5,
        rotateY: 5,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="h-full framer-motion-fallback"
    >
      {children}
    </m.div>
  )
}
