export const REFUNDABLE_ORDER_PAYMENT_STATUSES = ['PAID', 'PARTIALLY_REFUNDED'] as const
export const REFUNDABLE_PAYMENT_STATUSES = ['CAPTURED', 'PARTIALLY_REFUNDED'] as const

type RefundPayment = {
  status: string
  amountPaise: number
  metadata?: unknown
}

export function remainingRefundablePaise(payment: RefundPayment | null | undefined) {
  if (!payment) return 0
  const meta = payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
    ? payment.metadata as Record<string, unknown>
    : {}
  const alreadyRefundedPaise = typeof meta.totalRefundedPaise === 'number' ? meta.totalRefundedPaise : 0
  return Math.max(0, payment.amountPaise - alreadyRefundedPaise)
}

export function canIssueRefund(order: { paymentStatus: string; payment: RefundPayment | null | undefined }) {
  return REFUNDABLE_ORDER_PAYMENT_STATUSES.includes(order.paymentStatus as typeof REFUNDABLE_ORDER_PAYMENT_STATUSES[number])
    && Boolean(order.payment)
    && REFUNDABLE_PAYMENT_STATUSES.includes(order.payment!.status as typeof REFUNDABLE_PAYMENT_STATUSES[number])
    && remainingRefundablePaise(order.payment) > 0
}
