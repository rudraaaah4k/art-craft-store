'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { LenisProvider, PageTransition } from './index'

export function StorefrontMotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <LenisProvider>
      <PageTransition route={pathname}>
        {children}
      </PageTransition>
    </LenisProvider>
  )
}
