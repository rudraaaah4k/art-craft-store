import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reviewSchema } from '@/lib/validation'

import { verifyCsrfOrigin } from '@/lib/csrf'

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) return NextResponse.json({ message: 'CSRF verification failed' }, { status: 403 })
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Please log in to review.' }, { status: 401 })
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review.' }, { status: 400 })
  const deliveredPurchase = await prisma.order.findFirst({ where: { userId: session.user.id, status: 'DELIVERED', items: { some: { productId: parsed.data.productId } } } })
  if (!deliveredPurchase) return NextResponse.json({ error: 'Reviews are available after delivery.' }, { status: 403 })
  try {
    const review = await prisma.review.create({ data: { userId: session.user.id, productId: parsed.data.productId, rating: parsed.data.rating, title: parsed.data.title || null, body: parsed.data.body || null } })
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 })
  }
}