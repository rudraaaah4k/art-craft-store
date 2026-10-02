import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { PackageDimensions } from '@/lib/providers/shipping'

const shipmentOrderInclude = {
  items: { include: { product: true } },
  shipment: true,
} as const

type ShipmentOrder = Prisma.OrderGetPayload<{ include: typeof shipmentOrderInclude }>

export type ShipmentContext = {
  order: ShipmentOrder
  weightGrams: number
  dimensionsCm: PackageDimensions
  pickupAddress: {
    name: string
    email: string
    phone: string
    line1: string
    line2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
  items: Array<{ title: string; sku: string | null; quantity: number; unitPricePaise: number }>
}

export async function getShipmentContext(orderId: string): Promise<ShipmentContext> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: shipmentOrderInclude })
  if (!order) throw new Error('Order not found.')
  if (order.shipment) throw new Error('A shipment already exists for this order.')
  if (!['PAID', 'AUTHORIZED'].includes(order.paymentStatus) || ['PENDING', 'FAILED', 'CANCELLED'].includes(order.status)) {
    throw new Error('Order must be paid or confirmed COD before shipment creation.')
  }

  const missingPickupFields: string[] = []
  const settings = await prisma.settings.findUnique({ where: { key: 'default' } })
  if (!settings?.pickupName) missingPickupFields.push('pickup contact name')
  if (!settings?.pickupEmail) missingPickupFields.push('pickup email')
  if (!settings?.pickupPhone) missingPickupFields.push('pickup phone')
  if (!settings?.pickupAddressLine1) missingPickupFields.push('pickup address line 1')
  if (!settings?.pickupCity) missingPickupFields.push('pickup city')
  if (!settings?.pickupState) missingPickupFields.push('pickup state')
  if (!settings?.pickupPostalCode) missingPickupFields.push('pickup pincode')
  if (missingPickupFields.length) throw new Error(`Configure pickup address first: missing ${missingPickupFields.join(', ')}.`)

  let weightGrams = 0
  let lengthCm = 0
  let widthCm = 0
  let heightCm = 0
  const items: ShipmentContext['items'] = []

  for (const item of order.items) {
    const product = item.product
    if (!product) throw new Error(`Cannot create shipment: "${item.title}" no longer has a product record.`)
    const missingFields: string[] = []
    if (!product.weightGrams || product.weightGrams <= 0) missingFields.push('weightGrams')
    if (!product.lengthCm || product.lengthCm <= 0) missingFields.push('lengthCm')
    if (!product.widthCm || product.widthCm <= 0) missingFields.push('widthCm')
    if (!product.heightCm || product.heightCm <= 0) missingFields.push('heightCm')
    if (missingFields.length) throw new Error(`Cannot create shipment: "${item.title}" is missing ${missingFields.join(', ')}.`)

    weightGrams += product.weightGrams * item.quantity
    lengthCm = Math.max(lengthCm, product.lengthCm!)
    widthCm = Math.max(widthCm, product.widthCm!)
    heightCm += product.heightCm! * item.quantity
    items.push({ title: item.title, sku: item.sku, quantity: item.quantity, unitPricePaise: item.unitPricePaise })
  }

  return {
    order,
    weightGrams,
    dimensionsCm: { lengthCm, widthCm, heightCm },
    pickupAddress: {
      name: settings!.pickupName!,
      email: settings!.pickupEmail!,
      phone: settings!.pickupPhone!,
      line1: settings!.pickupAddressLine1!,
      line2: settings!.pickupAddressLine2,
      city: settings!.pickupCity!,
      state: settings!.pickupState!,
      postalCode: settings!.pickupPostalCode!,
      country: settings!.pickupCountry,
    },
    items,
  }
}