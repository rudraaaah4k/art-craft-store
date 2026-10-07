import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { IssueRefundForm } from '../IssueRefundForm'

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, shipment: true },
  })
  if (!order) notFound()

  const paymentMeta = order.payment?.metadata && typeof order.payment.metadata === 'object' && !Array.isArray(order.payment.metadata)
    ? order.payment.metadata as {
        totalRefundedPaise?: number
        refunds?: Array<{ refundId: string; amountPaise: number; reason?: string; notes?: string | null; refundedAt?: string }>
      }
    : {}
  const refunds = Array.isArray(paymentMeta.refunds) ? paymentMeta.refunds : []

  return (
    <section className="rounded-xl border border-sand bg-cream p-5 sm:p-7">
      <Link href="/admin/orders" className="text-sm font-semibold text-terracotta hover:underline">
        Back to orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/60">Order detail</p>
          <h1 className="mt-1 font-serif text-2xl text-deep-olive">Order {order.id}</h1>
          <p className="mt-1 text-sm text-charcoal/70">
            {order.email} · {order.status} / {order.paymentStatus}
          </p>
        </div>
        <a
          href={`/api/admin/orders/${order.id}/invoice`}
          target="_blank"
          rel="noreferrer"
          className="min-h-11 rounded-md border border-deep-olive px-4 py-2 text-sm font-semibold text-deep-olive"
        >
          Download invoice
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-sand bg-white p-4">
          <h2 className="font-semibold text-charcoal">Customer & shipping</h2>
          <p className="mt-2 text-sm text-charcoal/80">{order.shippingFullName}</p>
          <p className="text-sm text-charcoal/80">{order.shippingPhone}</p>
          <p className="text-sm text-charcoal/80">
            {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ''}
          </p>
          <p className="text-sm text-charcoal/80">
            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
          </p>
        </div>
        <div className="rounded-lg border border-sand bg-white p-4">
          <h2 className="font-semibold text-charcoal">Payment</h2>
          <p className="mt-2 text-sm text-charcoal/80">Order: {order.paymentStatus}</p>
          <p className="text-sm text-charcoal/80">
            Record: {order.payment ? `${order.payment.status} · ${money(order.payment.amountPaise)}` : 'None'}
          </p>
          {order.shipment && (
            <div className="mt-2 text-sm text-charcoal/80">
              <p>
                Shipment {order.shipment.status}
                {order.shipment.trackingNumber ? ` · AWB ${order.shipment.trackingNumber}` : ''}
              </p>
              {order.shipment.labelUrl && (
                <a href={order.shipment.labelUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-terracotta hover:underline">
                  Download mock label
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-sand bg-white p-4">
        <h2 className="font-semibold text-charcoal">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.title} × {item.quantity}</span>
              <span>{money(item.totalPaise)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-sand pt-3 font-semibold">
          <span>Total</span>
          <span>{money(order.totalPaise)}</span>
        </p>
      </div>

      {refunds.length > 0 && (
        <div className="mt-6 rounded-lg border border-sand bg-white p-4">
          <h2 className="font-semibold text-charcoal">Refund history</h2>
          <ul className="mt-3 space-y-2 text-sm text-charcoal/80">
            {refunds.map((entry) => (
              <li key={entry.refundId}>
                {money(entry.amountPaise)} · {entry.reason ?? 'customer_request'} · {entry.refundId}
              </li>
            ))}
          </ul>
        </div>
      )}

      <IssueRefundForm
        orderId={order.id}
        paymentStatus={order.paymentStatus}
        payment={order.payment ? { status: order.payment.status, amountPaise: order.payment.amountPaise, metadata: order.payment.metadata } : null}
      />
    </section>
  )
}
