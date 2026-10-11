'use client'

import { useEffect, useState, RefObject } from 'react'

export function useScrollProgress(containerRef?: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrameId: number

    const handleScroll = () => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = requestAnimationFrame(() => {
        if (containerRef && containerRef.current) {
          const el = containerRef.current
          const rect = el.getBoundingClientRect()
          const totalScrollable = el.offsetHeight - window.innerHeight
          if (totalScrollable <= 0) {
            setProgress(0)
            return
          }
          const current = -rect.top
          const clamped = Math.max(0, Math.min(1, current / totalScrollable))
          setProgress(clamped)
        } else {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          if (docHeight <= 0) {
            setProgress(0)
            return
          }
          const current = window.scrollY
          const clamped = Math.max(0, Math.min(1, current / docHeight))
          setProgress(clamped)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [containerRef])

  return progress
}
