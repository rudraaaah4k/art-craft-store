import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { getShippingProvider } from '@/lib/providers/shipping'
import { getShipmentContext } from '@/lib/shipping-orders'
import { z } from 'zod'

type Context = { params: Promise<{ id: string }> }
const orderIdSchema = z.string().trim().min(1).max(100)

export async function GET(_request: Request, { params }: Context) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsedId = orderIdSchema.safeParse(id)
  if (!parsedId.success) return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 })

  try {
    const context = await getShipmentContext(parsedId.data)
    const rates = await getShippingProvider().getRates({
      postalCode: context.order.shippingPostalCode,
      weightGrams: context.weightGrams,
      amountPaise: context.order.totalPaise,
      dimensionsCm: context.dimensionsCm,
    })
    if (!rates.length) return NextResponse.json({ message: `No mock couriers serve pincode ${context.order.shippingPostalCode}.` }, { status: 400 })
    return NextResponse.json({ weightGrams: context.weightGrams, dimensionsCm: context.dimensionsCm, rates })
  } catch {
    return NextResponse.json({ message: 'Unable to list couriers.' }, { status: 400 })
  }
}