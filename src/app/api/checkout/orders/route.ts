import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRequestCart } from '@/lib/cart'
import { assertAndReserveStock, calculateCheckoutTotals } from '@/lib/checkout'
import { prisma } from '@/lib/prisma'
import { checkoutOrderSchema } from '@/lib/validation'
import { enforceRateLimit } from '@/lib/rate-limit'

import { verifyCsrfOrigin } from '@/lib/csrf'

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) return NextResponse.json({ message: 'CSRF verification failed' }, { status: 403 })
  if (!await enforceRateLimit(request, 'checkout-order', 10)) return NextResponse.json({ error: 'Too many checkout attempts. Try again later.' }, { status: 429 })
  const parsed = checkoutOrderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid order details.' }, { status: 400 })
  const session = await auth()
  const { cart, sessionId } = await getRequestCart()
  if (!cart || cart.items.length === 0) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const totals = await calculateCheckoutTotals(cart, parsed.data, transaction)
      const address = session?.user?.id && parsed.data.addressId
        ? await transaction.address.findFirst({ where: { id: parsed.data.addressId, userId: session.user.id } })
        : null
      const order = await transaction.order.create({
        data: {
          userId: session?.user?.id,
          email: parsed.data.email,
          subtotalPaise: totals.subtotalPaise,
          discountPaise: totals.discountPaise,
          shippingPaise: totals.shippingPaise,
          gstPaise: totals.gstPaise,
          codFeePaise: totals.codFeePaise,
          totalPaise: totals.totalPaise,
          shippingAddressId: address?.id,
          shippingFullName: address?.fullName ?? parsed.data.fullName,
          shippingPhone: address?.phone ?? parsed.data.phone,
          shippingLine1: address?.line1 ?? parsed.data.line1,
          shippingLine2: address?.line2 ?? (parsed.data.line2 || null),
          shippingCity: address?.city ?? parsed.data.city,
          shippingState: address?.state ?? parsed.data.state,
          shippingPostalCode: address?.postalCode ?? parsed.data.postalCode,
          paymentStatus: parsed.data.paymentMethod === 'COD' ? 'AUTHORIZED' : 'PENDING',
          status: parsed.data.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          items: { create: totals.items.map((item) => ({ productId: item.productId, variantId: item.variantId, title: item.title, sku: item.sku, quantity: item.quantity, unitPricePaise: item.unitPricePaise, gstPercent: item.gstPercent, totalPaise: item.totalPaise })) },
        },
      })
      await assertAndReserveStock(transaction, totals.items, order.id, sessionId)
      if (parsed.data.couponCode) await transaction.coupon.update({ where: { code: totals.couponCode! }, data: { uses: { increment: 1 } } })
      await transaction.cartItem.deleteMany({ where: { cartId: cart.id } })
      return order
    })
    return NextResponse.json({ orderId: order.id, totalPaise: order.totalPaise, paymentMethod: parsed.data.paymentMethod }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 400 })
  }
}