import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/account/orders')
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, include: { items: { take: 1 } } })
  return <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12"><h1 className="text-3xl font-serif font-bold mb-8">Order History</h1>{orders.length === 0 ? <p className="text-charcoal/70">You have not placed any orders yet.</p> : <div className="space-y-4">{orders.map((order) => <Link href={`/account/orders/${order.id}`} key={order.id} className="block border border-sand bg-white p-5 hover:border-terracotta"><div className="flex justify-between gap-4"><span className="font-medium">Order {order.id}</span><span className="text-sm text-charcoal/60">{order.status}</span></div><p className="mt-2 text-sm text-charcoal/70">{order.items[0]?.title ?? 'Order'} · ₹{(order.totalPaise / 100).toLocaleString('en-IN')}</p></Link>)}</div>}</div>
}