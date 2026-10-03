import { NextResponse } from 'next/server'
import { z } from 'zod'
import { CART_COOKIE, cartResponseItems, getRequestCart } from '@/lib/cart'
import { prisma } from '@/lib/prisma'
import { cartItemSchema, cartUpdateSchema } from '@/lib/validation'

const itemIdSchema = z.object({ id: z.string().trim().min(1).max(100) })

function withCartCookie(response: NextResponse, sessionId: string | undefined, shouldSetCookie: boolean) {
  if (shouldSetCookie && sessionId) {
    response.cookies.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
  }
  return response
}

export async function GET() {
  const { cart, sessionId, shouldSetCookie } = await getRequestCart()
  return withCartCookie(NextResponse.json({ items: cartResponseItems(cart), count: cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0 }), sessionId, shouldSetCookie)
}

export async function POST(request: Request) {
  try {
    const parsed = cartItemSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Invalid cart item.' }, { status: 400 })

    const { productId, variantId, quantity } = parsed.data
    const product = await prisma.product.findFirst({
      where: { id: productId, status: 'PUBLISHED', deletedAt: null },
      include: { variants: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

    if (variantId && !product.variants.some((variant) => variant.id === variantId)) {
      return NextResponse.json({ error: 'Invalid product variant.' }, { status: 400 })
    }

    const { cart, sessionId, shouldSetCookie } = await getRequestCart(true)
    if (!cart) return NextResponse.json({ error: 'Unable to create cart.' }, { status: 500 })
    const existing = cart.items.find((item) => item.productId === productId && item.variantId === (variantId ?? null))
    const nextQuantity = (existing?.quantity ?? 0) + quantity
    if (nextQuantity > 20) return NextResponse.json({ error: 'Maximum quantity is 20.' }, { status: 400 })

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } })
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId: variantId ?? null, quantity } })
    }

    const response = NextResponse.json({ message: 'Added to cart.', count: (cart.items.reduce((total, item) => total + item.quantity, 0) - (existing?.quantity ?? 0)) + nextQuantity })
    return withCartCookie(response, sessionId, shouldSetCookie)
  } catch (error) {
    console.error('[cart POST] Error:', error)
    return NextResponse.json({ error: 'Unable to add to cart.', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)
  const parsedId = itemIdSchema.safeParse(body)
  const parsedQuantity = cartUpdateSchema.safeParse(body)
  if (!parsedId.success || !parsedQuantity.success) return NextResponse.json({ error: 'Invalid cart update.' }, { status: 400 })

  const { cart } = await getRequestCart()
  if (!cart) return NextResponse.json({ error: 'Cart not found.' }, { status: 404 })
  const item = cart.items.find((cartItem) => cartItem.id === parsedId.data.id)
  if (!item) return NextResponse.json({ error: 'Cart item not found.' }, { status: 404 })

  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parsedQuantity.data.quantity } })
  return NextResponse.json({ message: 'Cart updated.' })
}

export async function DELETE(request: Request) {
  const parsed = itemIdSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid cart item.' }, { status: 400 })
  const { cart } = await getRequestCart()
  if (!cart) return NextResponse.json({ error: 'Cart not found.' }, { status: 404 })
  await prisma.cartItem.deleteMany({ where: { id: parsed.data.id, cartId: cart.id } })
  return NextResponse.json({ message: 'Removed from cart.' })
}