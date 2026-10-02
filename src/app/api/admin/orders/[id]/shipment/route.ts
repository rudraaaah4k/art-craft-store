import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { getShippingProvider } from '@/lib/providers/shipping'
import { getShipmentContext } from '@/lib/shipping-orders'
import { createMockShipmentSchema } from '@/lib/validation'
import { z } from 'zod'

type Context = { params: Promise<{ id: string }> }
const orderIdSchema = z.string().trim().min(1).max(100)

export async function POST(request: Request, { params }: Context) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsedId = orderIdSchema.safeParse(id)
  const parsedBody = createMockShipmentSchema.safeParse(await request.json().catch(() => null))
  if (!parsedId.success || !parsedBody.success) return NextResponse.json({ message: 'Invalid shipment request.' }, { status: 400 })

  try {
    const context = await getShipmentContext(parsedId.data)
    const provider = getShippingProvider()
    const rates = await provider.getRates({
      postalCode: context.order.shippingPostalCode,
      weightGrams: context.weightGrams,
      amountPaise: context.order.totalPaise,
      dimensionsCm: context.dimensionsCm,
    })
    const courier = rates.find((rate) => rate.id === parsedBody.data.courierId)
    if (!courier) return NextResponse.json({ message: 'Selected courier is unavailable for this order.' }, { status: 400 })

    const created = await provider.createShipment({
      orderId: context.order.id,
      postalCode: context.order.shippingPostalCode,
      weightGrams: context.weightGrams,
      dimensionsCm: context.dimensionsCm,
      courier,
      pickupAddress: context.pickupAddress,
      deliveryAddress: {
        name: context.order.shippingFullName,
        phone: context.order.shippingPhone,
        line1: context.order.shippingLine1,
        line2: context.order.shippingLine2,
        city: context.order.shippingCity,
        state: context.order.shippingState,
        postalCode: context.order.shippingPostalCode,
      },
      items: context.items,
    })

    const now = new Date().toISOString()
    const shipment = await prisma.$transaction(async (transaction) => {
      const createdShipment = await transaction.shipment.create({
        data: {
          orderId: context.order.id,
          provider: created.provider,
          providerOrderId: created.id,
          trackingNumber: created.trackingNumber,
          status: created.status,
          ratePaise: courier.amountPaise,
          labelUrl: created.labelUrl,
          metadata: {
            courierName: created.courierName,
            trackingUrl: created.trackingUrl,
            pickupScheduledAt: created.pickupScheduledAt,
            package: { weightGrams: context.weightGrams, ...context.dimensionsCm },
            timeline: [{ status: created.status, at: now }],
          },
        },
      })
      await transaction.order.update({ where: { id: context.order.id }, data: { status: 'PACKED', fulfillmentStatus: 'PACKED' } })
      return createdShipment
    })
    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) return NextResponse.json({ message: 'A shipment already exists for this order.' }, { status: 409 })
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to create mock shipment.' }, { status: 400 })
  }
}