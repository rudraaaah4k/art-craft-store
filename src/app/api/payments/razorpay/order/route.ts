import { NextResponse } from 'next/server'
import { getPaymentProvider } from '@/lib/providers/payments'
import { settlePayment } from '@/lib/payment-settlement'
import { prisma } from '@/lib/prisma'
import { paymentOrderSchema } from '@/lib/validation'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'payment-order', 10)) return NextResponse.json({ error: 'Too many payment attempts. Try again later.' }, { status: 429 })
  const parsed = paymentOrderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order.' }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, include: { payment: true } })
  if (!order || order.paymentStatus !== 'PENDING') return NextResponse.json({ error: 'Order is not payable.' }, { status: 400 })
  const provider = getPaymentProvider()
  try {
    const intent = await provider.createPayment({ orderId: order.id, amountPaise: order.totalPaise, currency: order.currency, metadata: { orderId: order.id } })
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, provider: intent.provider, amountPaise: intent.amountPaise, currency: intent.currency, status: intent.status === 'AUTHORIZED' ? 'CAPTURED' : 'PENDING', metadata: { externalOrderId: intent.externalOrderId } },
      update: { provider: intent.provider, amountPaise: intent.amountPaise, status: intent.status === 'AUTHORIZED' ? 'CAPTURED' : 'PENDING', metadata: { externalOrderId: intent.externalOrderId } },
    })
    if (intent.status === 'AUTHORIZED') await settlePayment({ orderId: order.id, provider: intent.provider, providerPaymentId: intent.id, metadata: { externalOrderId: intent.externalOrderId } })
    return NextResponse.json({ provider: intent.provider, keyId: process.env.RAZORPAY_KEY_ID ?? '', razorpayOrderId: intent.externalOrderId, amountPaise: intent.amountPaise, currency: intent.currency, mock: intent.provider === 'mock' })
  } catch {
    return NextResponse.json({ error: 'Unable to start payment.' }, { status: 502 })
  }
}