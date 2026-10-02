import type { Prisma } from '@prisma/client'
import { sendOrderNotification } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

export async function settlePayment(input: { orderId: string; provider: string; providerPaymentId: string; signature?: string; metadata?: Prisma.InputJsonValue }) {
  const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { payment: true } })
  if (!order) throw new Error('Order not found.')
  if (order.paymentStatus === 'PAID') return { alreadySettled: true, order }

  const settled = await prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, provider: input.provider, providerPaymentId: input.providerPaymentId, amountPaise: order.totalPaise, status: 'CAPTURED', signature: input.signature, metadata: input.metadata },
      update: { providerPaymentId: input.providerPaymentId, status: 'CAPTURED', signature: input.signature, metadata: input.metadata },
    })
    const updatedOrder = await transaction.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID', status: 'CONFIRMED' } })
    return { payment, order: updatedOrder }
  })
  await sendOrderNotification({ event: 'ORDER_CONFIRMED', orderId: order.id, email: order.email, phone: order.shippingPhone })
  return { alreadySettled: false, ...settled }
}