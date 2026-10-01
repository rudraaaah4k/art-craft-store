import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentOrderSchema } from '@/lib/validation'
import { enforceRateLimit } from '@/lib/rate-limit'
import { failOrderAndReleaseReservations } from '@/lib/checkout'

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'payment-failure', 10)) return NextResponse.json({ error: 'Too many payment attempts. Try again later.' }, { status: 429 })
  const parsed = paymentOrderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order.' }, { status: 400 })
  await prisma.$transaction((transaction) => failOrderAndReleaseReservations(transaction, parsed.data.orderId))
  return NextResponse.json({ ok: true })
}