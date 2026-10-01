import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { settlePayment } from '@/lib/payment-settlement'
import { paymentVerifySchema } from '@/lib/validation'
import { createHmac, timingSafeEqual } from 'node:crypto'

export async function POST(request: Request) {
  const parsed = paymentVerifySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment response.' }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, include: { payment: true } })
  const externalOrderId = order?.payment?.metadata && typeof order.payment.metadata === 'object' && 'externalOrderId' in order.payment.metadata ? order.payment.metadata.externalOrderId : null
  if (!order || externalOrderId !== parsed.data.razorpayOrderId) return NextResponse.json({ error: 'Payment order mismatch.' }, { status: 400 })
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '').update(`${parsed.data.razorpayOrderId}|${parsed.data.razorpayPaymentId}`).digest('hex')
  if (expected.length !== parsed.data.razorpaySignature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.data.razorpaySignature))) return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 })
  await settlePayment({ orderId: order.id, provider: 'razorpay', providerPaymentId: parsed.data.razorpayPaymentId, signature: parsed.data.razorpaySignature, metadata: { externalOrderId: parsed.data.razorpayOrderId } })
  return NextResponse.json({ ok: true, orderId: order.id })
}