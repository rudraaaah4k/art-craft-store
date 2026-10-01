import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentOrderSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const parsed = paymentOrderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order.' }, { status: 400 })
  await prisma.$transaction(async (transaction) => {
    const reservations = await transaction.stockReservation.findMany({ where: { orderId: parsed.data.orderId, status: 'ACTIVE' } })
    for (const reservation of reservations) {
      if (reservation.variantId) await transaction.variant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } })
      else await transaction.product.update({ where: { id: reservation.productId }, data: { stock: { increment: reservation.quantity } } })
      await transaction.stockReservation.update({ where: { id: reservation.id }, data: { status: 'RELEASED', releasedAt: new Date() } })
    }
    await transaction.order.update({ where: { id: parsed.data.orderId }, data: { status: 'FAILED', paymentStatus: 'FAILED' } })
  })
  return NextResponse.json({ ok: true })
}