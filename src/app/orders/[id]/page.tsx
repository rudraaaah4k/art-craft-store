import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payment: true } })
  if (!order) notFound()

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
      <div className="border border-sand bg-white p-8">
        <p className="text-deep-olive font-medium mb-2">Order confirmed</p>
        <h1 className="text-3xl font-serif font-bold mb-4">Thank you for your purchase</h1>
        <p className="text-charcoal/70 mb-8">Order ID: {order.id}</p>
        <div className="border-t border-sand pt-5 space-y-3">
          {order.items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.title} × {item.quantity}</span><span>₹{(item.totalPaise / 100).toLocaleString('en-IN')}</span></div>)}
          <div className="border-t border-sand pt-3 flex justify-between font-bold"><span>Total</span><span>₹{(order.totalPaise / 100).toLocaleString('en-IN')}</span></div>
        </div>
        <p className="mt-6 text-sm text-charcoal/70">A confirmation email has been queued for {order.email}.</p>
        <Link href="/shop" className="inline-block mt-8 bg-charcoal text-white px-5 py-3">Continue shopping</Link>
      </div>
    </div>
  )
}