'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const REFUNDABLE_ORDER_STATUSES = ['PAID', 'PARTIALLY_REFUNDED'] as const
export const REFUNDABLE_PAYMENT_STATUSES = ['CAPTURED', 'PARTIALLY_REFUNDED'] as const

type RefundReason = 'customer_request' | 'duplicate' | 'fraudulent' | 'other'

type PaymentInfo = {
  status: string
  amountPaise: number
  metadata?: unknown
}

function money(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function remainingPaise(payment: PaymentInfo) {
  const meta = payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
    ? payment.metadata as Record<string, unknown>
    : {}
  const already = typeof meta.totalRefundedPaise === 'number' ? meta.totalRefundedPaise : 0
  return Math.max(0, payment.amountPaise - already)
}

export function canIssueRefund(paymentStatus: string, payment: PaymentInfo | null | undefined) {
  return Boolean(
    REFUNDABLE_ORDER_STATUSES.includes(paymentStatus as (typeof REFUNDABLE_ORDER_STATUSES)[number])
    && payment
    && REFUNDABLE_PAYMENT_STATUSES.includes(payment.status as (typeof REFUNDABLE_PAYMENT_STATUSES)[number])
    && remainingPaise(payment) > 0,
  )
}

export function IssueRefundForm({
  orderId,
  paymentStatus,
  payment,
}: {
  orderId: string
  paymentStatus: string
  payment: PaymentInfo | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amountRupees, setAmountRupees] = useState('')
  const [reason, setReason] = useState<RefundReason>('customer_request')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const orderLooksRefundable = REFUNDABLE_ORDER_STATUSES.includes(paymentStatus as (typeof REFUNDABLE_ORDER_STATUSES)[number])
  if (!orderLooksRefundable) return null

  if (!payment || !REFUNDABLE_PAYMENT_STATUSES.includes(payment.status as (typeof REFUNDABLE_PAYMENT_STATUSES)[number])) {
    return (
      <p className="mt-4 text-sm text-charcoal/70">
        Refund is unavailable because this order has no captured payment record.
      </p>
    )
  }

  const remaining = remainingPaise(payment)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const payload: { amountPaise?: number; reason: RefundReason; notes?: string } = { reason }
      if (amountRupees.trim() !== '') {
        const paise = Math.round(Number.parseFloat(amountRupees) * 100)
        if (!Number.isFinite(paise) || paise <= 0) throw new Error('Enter a valid refund amount in rupees.')
        payload.amountPaise = paise
      }
      if (notes.trim()) payload.notes = notes.trim()

      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json() as { message?: string; paymentStatus?: string; remainingPaise?: number; isFullRefund?: boolean }
      if (!response.ok) throw new Error(data.message || 'Refund failed.')
      setMessage(
        data.isFullRefund
          ? `Full refund issued. Payment status: ${data.paymentStatus ?? 'REFUNDED'}.`
          : `Partial refund issued. Remaining: ${money(data.remainingPaise ?? 0)}.`,
      )
      setOpen(false)
      setAmountRupees('')
      setNotes('')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Refund failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div id="refund" className="mt-6 rounded-xl border border-sand bg-cream p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-deep-olive">Refund</h2>
          <p className="mt-1 text-sm text-charcoal/70">
            Paid {money(payment.amountPaise)} · Refundable {money(remaining)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen((value) => !value); setError(''); }}
          className="min-h-11 rounded-md bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {open ? 'Cancel' : 'Issue Refund'}
        </button>
      </div>
      {message && <p role="status" className="mt-3 text-sm font-medium text-deep-olive">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-terracotta">{error}</p>}
      {open && (
        <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-4 border-t border-sand pt-4">
          <div>
            <label htmlFor={`refund-amount-${orderId}`} className="block text-sm font-medium text-charcoal">
              Amount (₹)
            </label>
            <input
              id={`refund-amount-${orderId}`}
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amountRupees}
              onChange={(event) => setAmountRupees(event.target.value)}
              placeholder={`Leave blank for full ${money(remaining)}`}
              className="mt-1 min-h-11 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`refund-reason-${orderId}`} className="block text-sm font-medium text-charcoal">
              Reason (optional)
            </label>
            <select
              id={`refund-reason-${orderId}`}
              value={reason}
              onChange={(event) => setReason(event.target.value as RefundReason)}
              className="mt-1 min-h-11 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm"
            >
              <option value="customer_request">Customer request</option>
              <option value="duplicate">Duplicate payment</option>
              <option value="fraudulent">Fraudulent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor={`refund-notes-${orderId}`} className="block text-sm font-medium text-charcoal">
              Notes (optional)
            </label>
            <input
              id={`refund-notes-${orderId}`}
              type="text"
              maxLength={200}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded-md bg-deep-olive px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Issuing refund…' : 'Confirm refund'}
          </button>
        </form>
      )}
    </div>
  )
}
