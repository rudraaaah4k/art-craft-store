import type { Prisma } from '@prisma/client'
import { getShippingProvider } from '@/lib/providers/shipping'
import { prisma } from '@/lib/prisma'

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: { include: { images: true, variants: true } }
        variant: true
      }
    }
  }
}>

export type CheckoutDetails = {
  couponCode?: string
  postalCode: string
  paymentMethod: 'RAZORPAY' | 'COD'
}

export type CalculatedTotals = {
  subtotalPaise: number
  discountPaise: number
  shippingPaise: number
  gstPaise: number
  codFeePaise: number
  totalPaise: number
  weightGrams: number
  couponCode: string | null
  codAllowed: boolean
  items: Array<{
    cartItemId: string
    productId: string
    variantId: string | null
    title: string
    sku: string | null
    quantity: number
    unitPricePaise: number
    gstPercent: number
    totalPaise: number
  }>
}

export async function calculateCheckoutTotals(cart: CartWithItems, details: CheckoutDetails, transaction: typeof prisma | Prisma.TransactionClient = prisma): Promise<CalculatedTotals> {
  const settings = await transaction.settings.findUnique({ where: { key: 'default' } })
  const now = new Date()
  let subtotalPaise = 0
  let gstPaise = 0
  let weightGrams = 0
  let codAllowed = Boolean(settings?.codEnabled ?? true)
  const items: CalculatedTotals['items'] = []

  for (const item of cart.items) {
    const product = await transaction.product.findUnique({ where: { id: item.productId }, include: { variants: true } })
    if (!product || product.status !== 'PUBLISHED' || product.deletedAt) throw new Error('A product in your cart is no longer available.')
    const variant = item.variantId ? product.variants.find((candidate) => candidate.id === item.variantId) : null
    if (product.variants.length > 0 && !variant) throw new Error(`Select an option for ${product.title}.`)
    const unitPricePaise = variant?.price ?? product.salePrice ?? product.price
    const lineTotalPaise = unitPricePaise * item.quantity
    subtotalPaise += lineTotalPaise
    gstPaise += Math.round(lineTotalPaise * product.gstPercent / (100 + product.gstPercent))
    weightGrams += product.weightGrams * item.quantity
    codAllowed = codAllowed && product.codAllowed && !product.isMadeToOrder
    items.push({
      cartItemId: item.id,
      productId: product.id,
      variantId: variant?.id ?? null,
      title: product.title,
      sku: variant?.sku ?? product.sku,
      quantity: item.quantity,
      unitPricePaise,
      gstPercent: product.gstPercent,
      totalPaise: lineTotalPaise,
    })
  }

  let discountPaise = 0
  let couponCode: string | null = null
  const normalizedCoupon = details.couponCode?.trim().toUpperCase()
  if (normalizedCoupon) {
    const coupon = await transaction.coupon.findUnique({ where: { code: normalizedCoupon } })
    if (!coupon || (coupon.validUntil && coupon.validUntil < now) || (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) || (coupon.minOrderPaise !== null && subtotalPaise < coupon.minOrderPaise)) {
      throw new Error('Coupon is invalid or not applicable.')
    }
    discountPaise = coupon.type === 'PERCENT'
      ? Math.floor(subtotalPaise * coupon.discountValue / 100)
      : Math.min(coupon.discountValue, subtotalPaise)
    couponCode = coupon.code
  }

  const shippingRates = await getShippingProvider().getRates({ postalCode: details.postalCode, weightGrams, amountPaise: subtotalPaise - discountPaise })
  const shippingPaise = shippingRates[0]?.amountPaise ?? 0
  const codFeePaise = details.paymentMethod === 'COD' ? (settings?.codFeePaise ?? 500) : 0
  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise + codFeePaise)
  const codMaxPaise = settings?.codMaxPaise ?? 300000
  if (details.paymentMethod === 'COD' && (!codAllowed || totalPaise > codMaxPaise)) throw new Error('Cash on Delivery is not available for this order.')

  return { subtotalPaise, discountPaise, shippingPaise, gstPaise, codFeePaise, totalPaise, weightGrams, couponCode, codAllowed: codAllowed && totalPaise <= codMaxPaise, items }
}

export async function releaseExpiredReservations(transaction: Prisma.TransactionClient | typeof prisma) {
  const expired = await transaction.stockReservation.findMany({ where: { status: 'ACTIVE', expiresAt: { lte: new Date() } } })
  for (const reservation of expired) {
    if (reservation.variantId) await transaction.variant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } })
    else await transaction.product.update({ where: { id: reservation.productId }, data: { stock: { increment: reservation.quantity } } })
    await transaction.stockReservation.update({ where: { id: reservation.id }, data: { status: 'EXPIRED', releasedAt: new Date() } })
  }
  return expired.length
}

export async function assertAndReserveStock(transaction: Prisma.TransactionClient, items: CalculatedTotals['items'], orderId: string, sessionId?: string) {
  await releaseExpiredReservations(transaction)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  for (const item of items) {
    const stockUpdate = item.variantId
      ? await transaction.variant.updateMany({ where: { id: item.variantId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } })
      : await transaction.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } })
    if (stockUpdate.count !== 1) throw new Error(`Not enough stock for ${item.title}.`)
    await transaction.stockReservation.create({ data: { orderId, sessionId, productId: item.productId, variantId: item.variantId, quantity: item.quantity, expiresAt } })
  }
  return expiresAt
}