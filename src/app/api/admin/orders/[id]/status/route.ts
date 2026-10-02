import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { mockShipmentStatusSchema } from '@/lib/validation'
import { z } from 'zod'

type Context = { params: Promise<{ id: string }> }
const orderIdSchema = z.string().trim().min(1).max(100)
const progression = ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const

export async function PATCH(request: Request, { params }: Context) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsedId = orderIdSchema.safeParse(id)
  const parsedBody = mockShipmentStatusSchema.safeParse(await request.json().catch(() => null))
  if (!parsedId.success || !parsedBody.success) return NextResponse.json({ message: 'Invalid mock status update.' }, { status: 400 })

  const shipment = await prisma.shipment.findUnique({ where: { orderId: parsedId.data } })
  if (!shipment) return NextResponse.json({ message: 'Shipment not found.' }, { status: 404 })
  const currentIndex = progression.indexOf(shipment.status as typeof progression[number])
  const nextIndex = progression.indexOf(parsedBody.data.status)
  if (nextIndex === currentIndex) return NextResponse.json(shipment)
  if (nextIndex !== currentIndex + 1) return NextResponse.json({ message: 'Mock shipment statuses must advance one scan at a time.' }, { status: 409 })

  const previousMetadata = shipment.metadata && typeof shipment.metadata === 'object' && !Array.isArray(shipment.metadata) ? shipment.metadata : {}
  const previousTimeline = 'timeline' in previousMetadata && Array.isArray(previousMetadata.timeline) ? previousMetadata.timeline : []
  const updated = await prisma.$transaction(async (transaction) => {
    const updatedShipment = await transaction.shipment.update({
      where: { id: shipment.id },
      data: {
        status: parsedBody.data.status,
        metadata: { ...previousMetadata, timeline: [...previousTimeline, { status: parsedBody.data.status, at: new Date().toISOString() }] },
      },
    })
    await transaction.order.update({
      where: { id: shipment.orderId },
      data: {
        status: parsedBody.data.status,
        fulfillmentStatus: parsedBody.data.status === 'DELIVERED' ? 'FULFILLED' : parsedBody.data.status,
      },
    })
    return updatedShipment
  })
  return NextResponse.json(updated)
}