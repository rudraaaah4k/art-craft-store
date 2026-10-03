import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/account/orders')
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, include: { items: { take: 1 } } })
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-charcoal">Order History</h1>
      {orders.length === 0 ? (
        <div className="bg-sand/10 border border-sand p-16 text-center rounded flex flex-col items-center justify-center min-h-[40vh]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-charcoal/30 mb-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h2 className="text-2xl font-serif text-charcoal mb-4">No orders yet</h2>
          <p className="text-charcoal/70 mb-8 max-w-md mx-auto">When you place an order, its details and tracking status will appear here.</p>
          <Link href="/shop" className="inline-block bg-terracotta text-white px-8 py-3 font-medium hover:bg-charcoal transition-colors rounded">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link href={`/account/orders/${order.id}`} key={order.id} className="block border border-sand bg-white p-5 hover:border-terracotta transition-colors">
              <div className="flex justify-between gap-4">
                <span className="font-medium text-charcoal">Order {order.id}</span>
                <span className="text-sm text-charcoal/60 bg-sand/30 px-3 py-1 rounded-full">{order.status}</span>
              </div>
              <p className="mt-3 text-sm text-charcoal/70">{order.items[0]?.title ?? 'Order'} · ₹{(order.totalPaise / 100).toLocaleString('en-IN')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}