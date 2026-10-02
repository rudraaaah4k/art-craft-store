import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Context = { params: Promise<{ id: string }> }
const orderIdSchema = z.string().trim().min(1).max(100)
const refundSchema = z.object({
  amountPaise: z.number().int().positive('Refund amount must be positive.'),
  reason: z.enum(['duplicate', 'fraudulent', 'customer_request', 'other']).default('customer_request'),
  notes: z.string().max(200).optional(),
})

function hasRazorpayCredentials() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_ID.startsWith('your-')
  )
}

export async function POST(request: Request, { params }: Context) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsedId = orderIdSchema.safeParse(id)
  const parsedBody = refundSchema.safeParse(await request.json().catch(() => null))
  if (!parsedId.success || !parsedBody.success) {
    return NextResponse.json({ message: 'Invalid refund request.', issues: parsedBody.success ? null : parsedBody.error.flatten() }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: parsedId.data },
    include: { payment: true },
  })
  if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 })
  if (!order.payment) return NextResponse.json({ message: 'No payment found for this order.' }, { status: 400 })
  if (order.payment.status !== 'CAPTURED') {
    return NextResponse.json({ message: 'Payment is not in a capturable state; cannot refund.' }, { status: 400 })
  }

  // Idempotency: sum already-refunded amount from metadata
  const meta = order.payment.metadata && typeof order.payment.metadata === 'object' && !Array.isArray(order.payment.metadata)
    ? order.payment.metadata as Record<string, unknown>
    : {}
  const alreadyRefundedPaise: number = typeof meta.totalRefundedPaise === 'number' ? meta.totalRefundedPaise : 0
  const remainingPaise = order.payment.amountPaise - alreadyRefundedPaise
  if (parsedBody.data.amountPaise > remainingPaise) {
    return NextResponse.json({
      message: `Refund amount (₹${(parsedBody.data.amountPaise / 100).toFixed(2)}) exceeds refundable balance (₹${(remainingPaise / 100).toFixed(2)}).`,
    }, { status: 400 })
  }

  let providerRefundId: string
  if (hasRazorpayCredentials() && order.payment.providerPaymentId) {
    // Real Razorpay refund
    const credentials = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    const response = await fetch(`https://api.razorpay.com/v1/payments/${order.payment.providerPaymentId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parsedBody.data.amountPaise,
        notes: { reason: parsedBody.data.reason, notes: parsedBody.data.notes ?? '' },
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as Record<string, unknown>
      return NextResponse.json({ message: (err as { error?: { description?: string } }).error?.description ?? 'Razorpay refund failed.' }, { status: 502 })
    }
    const refundData = await response.json() as { id: string }
    providerRefundId = refundData.id
  } else {
    // Mock path — app runs locally without Razorpay credentials
    providerRefundId = `mock_refund_${Date.now()}`
  }

  const newTotalRefundedPaise = alreadyRefundedPaise + parsedBody.data.amountPaise
  const refunds = Array.isArray(meta.refunds) ? meta.refunds : []
  const isFullRefund = newTotalRefundedPaise >= order.payment.amountPaise

  const updatedPayment = await prisma.payment.update({
    where: { id: order.payment.id },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      metadata: {
        ...meta,
        totalRefundedPaise: newTotalRefundedPaise,
        refunds: [
          ...refunds,
          {
            refundId: providerRefundId,
            amountPaise: parsedBody.data.amountPaise,
            reason: parsedBody.data.reason,
            notes: parsedBody.data.notes ?? null,
            refundedAt: new Date().toISOString(),
          },
        ],
      },
    },
  })

  if (isFullRefund) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' } })
  }

  return NextResponse.json({
    refundId: providerRefundId,
    amountPaise: parsedBody.data.amountPaise,
    totalRefundedPaise: newTotalRefundedPaise,
    remainingPaise: order.payment.amountPaise - newTotalRefundedPaise,
    paymentStatus: updatedPayment.status,
    isFullRefund,
  })
}
