'use client'

import dynamic from 'next/dynamic'

export const ReviewFormLazy = dynamic(
  () => import('./ReviewForm').then((mod) => mod.ReviewForm),
  { ssr: false }
)
