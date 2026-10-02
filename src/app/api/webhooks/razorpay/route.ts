import { NextResponse } from 'next/server'
import { verifyRazorpayWebhook } from '@/lib/providers/payments'
import { prisma } from '@/lib/prisma'
import { settlePayment } from '@/lib/payment-settlement'
import { razorpayWebhookSchema } from '@/lib/validation'
import { enforceRateLimit } from '@/lib/rate-limit'
import { failOrderAndReleaseReservations } from '@/lib/checkout'

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'razorpay-webhook', 100)) return NextResponse.json({ error: 'Too many webhook attempts.' }, { status: 429 })
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''
  const eventId = request.headers.get('x-razorpay-event-id') ?? ''
  if (!eventId || !signature || !verifyRazorpayWebhook(rawBody, signature)) return NextResponse.json({ error: 'Invalid webhook.' }, { status: 400 })
  let payload: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } } }
  try { payload = razorpayWebhookSchema.parse(JSON.parse(rawBody)) } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }) }
  console.info('[razorpay-webhook] signature verified', { eventId, event: payload.event })

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.webhookEvent.create({ data: { provider: 'razorpay', eventId, payload } })
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) return NextResponse.json({ ok: true, duplicate: true })
    throw error
  }

  if (payload.event === 'payment.captured' || payload.event === 'payment.authorized' || payload.event === 'payment.failed') {
    const entity = payload.payload?.payment?.entity
    if (entity?.id && entity.order_id) {
      const payments = await prisma.payment.findMany({ where: { provider: 'razorpay' } })
      const payment = payments.find((candidate) => candidate.metadata && typeof candidate.metadata === 'object' && 'externalOrderId' in candidate.metadata && candidate.metadata.externalOrderId === entity.order_id)
      if (payment && payload.event === 'payment.failed') {
        await prisma.$transaction((transaction) => failOrderAndReleaseReservations(transaction, payment.orderId, entity.id))
      } else if (payment) {
        await settlePayment({ orderId: payment.orderId, provider: 'razorpay', providerPaymentId: entity.id, metadata: { externalOrderId: entity.order_id, eventId } })
      }
    }
  }
  return NextResponse.json({ ok: true })
}