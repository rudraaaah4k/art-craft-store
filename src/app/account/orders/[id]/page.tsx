import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShipmentTracking } from '@/components/ShipmentTracking'

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/account/orders')
  const { id } = await params
  const order = await prisma.order.findFirst({ where: { id, userId: session.user.id }, include: { items: true, payment: true, shipment: true } })
  if (!order) notFound()
  return <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12"><Link href="/account/orders" className="text-sm text-terracotta hover:underline">Back to orders</Link><h1 className="text-3xl font-serif font-bold mt-4 mb-2">Order details</h1><p className="text-sm text-charcoal/60 mb-8">{order.id} · {order.status}</p><div className="border border-sand bg-white p-6 space-y-4">{order.items.map((item) => <div key={item.id} className="flex justify-between"><span>{item.title} × {item.quantity}</span><span>₹{(item.totalPaise / 100).toLocaleString('en-IN')}</span></div>)}<div className="border-t border-sand pt-4 flex justify-between font-bold"><span>Total</span><span>₹{(order.totalPaise / 100).toLocaleString('en-IN')}</span></div><p className="pt-4 text-sm text-charcoal/70">Delivering to {order.shippingFullName}, {order.shippingCity}, {order.shippingPostalCode}</p></div>{order.shipment && <ShipmentTracking shipment={order.shipment} />}</div>
}