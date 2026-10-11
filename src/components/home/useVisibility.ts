'use client'

import { useEffect, useState, RefObject } from 'react'

export function useVisibility(containerRef?: RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 1. Tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false)
      } else {
        // If containerRef provided, check if in viewport
        if (containerRef && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setIsVisible(rect.bottom > 0 && rect.top < window.innerHeight)
        } else {
          setIsVisible(true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 2. Intersection observer if containerRef is provided
    let observer: IntersectionObserver | null = null
    if (containerRef && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting && !document.hidden)
        },
        { threshold: 0.05 }
      )
      observer.observe(containerRef.current)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (observer) observer.disconnect()
    }
  }, [containerRef])

  return isVisible
}
