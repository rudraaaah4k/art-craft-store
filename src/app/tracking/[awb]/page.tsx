import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShipmentTracking } from '@/components/ShipmentTracking'
import { prisma } from '@/lib/prisma'

export default async function TrackingPage({ params }: { params: Promise<{ awb: string }> }) {
  const { awb } = await params
  const shipment = await prisma.shipment.findFirst({ where: { trackingNumber: awb } })
  if (!shipment) notFound()
  return <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12"><Link href={`/orders/${shipment.orderId}`} className="text-sm text-terracotta underline">Order details</Link><h1 className="mt-4 text-3xl font-serif font-bold">Track shipment</h1><p className="mt-2 text-sm text-charcoal/60">Order {shipment.orderId}</p><ShipmentTracking shipment={shipment} showTrackingLink={false} /></div>
}