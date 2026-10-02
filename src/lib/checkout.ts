import type { Prisma } from '@prisma/client'
import { getShippingProvider, type PackageDimensions } from '@/lib/providers/shipping'
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
  dimensionsCm?: PackageDimensions
  courierName: string
  estimatedDeliveryDays: number
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
  let packageLengthCm = 0
  let packageWidthCm = 0
  let packageHeightCm = 0
  let hasCompleteDimensions = true
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
    if (product.lengthCm && product.widthCm && product.heightCm) {
      packageLengthCm = Math.max(packageLengthCm, product.lengthCm)
      packageWidthCm = Math.max(packageWidthCm, product.widthCm)
      packageHeightCm += product.heightCm * item.quantity
    } else {
      hasCompleteDimensions = false
    }
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

  const dimensionsCm = hasCompleteDimensions && packageLengthCm > 0 && packageWidthCm > 0 && packageHeightCm > 0
    ? { lengthCm: packageLengthCm, widthCm: packageWidthCm, heightCm: packageHeightCm }
    : undefined
  let shippingRates
  try {
    shippingRates = await getShippingProvider().getRates({
      postalCode: details.postalCode,
      weightGrams,
      amountPaise: subtotalPaise - discountPaise,
      freeShippingThresholdPaise: settings?.freeShippingThreshold ?? 99900,
      dimensionsCm,
    })
  } catch {
    throw new Error('Delivery estimate is temporarily unavailable. Please retry shortly.')
  }
  if (shippingRates.length === 0) throw new Error(`Delivery is unavailable for pincode ${details.postalCode}. Try another pincode.`)
  const selectedRate = shippingRates.reduce((lowest, rate) => rate.amountPaise < lowest.amountPaise ? rate : lowest)
  const shippingPaise = selectedRate.amountPaise
  const codFeePaise = details.paymentMethod === 'COD' ? (settings?.codFeePaise ?? 500) : 0
  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise + codFeePaise)
  const codMaxPaise = settings?.codMaxPaise ?? 300000
  if (details.paymentMethod === 'COD' && (!codAllowed || totalPaise > codMaxPaise)) throw new Error('Cash on Delivery is not available for this order.')

  return { subtotalPaise, discountPaise, shippingPaise, gstPaise, codFeePaise, totalPaise, weightGrams, dimensionsCm, courierName: selectedRate.courierName, estimatedDeliveryDays: selectedRate.estimatedDays, couponCode, codAllowed: codAllowed && totalPaise <= codMaxPaise, items }
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

export async function failOrderAndReleaseReservations(transaction: Prisma.TransactionClient | typeof prisma, orderId: string, providerPaymentId?: string) {
  const reservations = await transaction.stockReservation.findMany({ where: { orderId, status: 'ACTIVE' } })
  for (const reservation of reservations) {
    if (reservation.variantId) await transaction.variant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } })
    else await transaction.product.update({ where: { id: reservation.productId }, data: { stock: { increment: reservation.quantity } } })
    await transaction.stockReservation.update({ where: { id: reservation.id }, data: { status: 'RELEASED', releasedAt: new Date() } })
  }
  await transaction.order.update({ where: { id: orderId }, data: { status: 'FAILED', paymentStatus: 'FAILED' } })
  await transaction.payment.update({ where: { orderId }, data: { ...(providerPaymentId ? { providerPaymentId } : {}), status: 'FAILED' } })
  return reservations.length
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