import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const CART_COOKIE = 'cart_session'

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
          variants: true,
        },
      },
      variant: true,
    },
  },
} as const

export async function mergeGuestCart(userId: string, sessionId: string) {
  const guestCart = await prisma.cart.findUnique({ where: { sessionId }, include: { items: true } })
  if (!guestCart) return

  await prisma.$transaction(async (transaction) => {
    const userCart = await transaction.cart.findFirst({ where: { userId } })
      ?? await transaction.cart.create({ data: { userId } })
    await transaction.cart.update({ where: { id: userCart.id }, data: { expiresAt: null } })

    if (userCart.id !== guestCart.id) {
      for (const item of guestCart.items) {
        const existing = await transaction.cartItem.findFirst({
          where: { cartId: userCart.id, productId: item.productId, variantId: item.variantId },
        })
        if (existing) {
          await transaction.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          })
        } else {
          await transaction.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          })
        }
      }
      await transaction.cart.delete({ where: { id: guestCart.id } })
    }
  })
}

export async function getRequestCart(createGuest = false) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(CART_COOKIE)?.value
  const session = await auth()

  if (session?.user?.id) {
    if (sessionId) await mergeGuestCart(session.user.id, sessionId)
    const cart = await prisma.cart.findFirst({ where: { userId: session.user.id }, include: cartInclude })
    return { cart, sessionId, shouldSetCookie: false }
  }

  if (sessionId) {
    const cart = await prisma.cart.findUnique({ where: { sessionId }, include: cartInclude })
    if (cart) return { cart, sessionId, shouldSetCookie: false }
    // Cart was deleted (e.g. merged into user cart) — fall through to create a new one
  }

  if (!createGuest) return { cart: null, sessionId: undefined, shouldSetCookie: false }

  const newSessionId = crypto.randomUUID()
  const cart = await prisma.cart.create({ data: { sessionId: newSessionId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, include: cartInclude })
  return { cart, sessionId: newSessionId, shouldSetCookie: true }
}

export function cartResponseItems(cart: Awaited<ReturnType<typeof getRequestCart>>['cart']) {
  return cart?.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      title: item.product.title,
      slug: item.product.slug,
      price: item.product.price,
      salePrice: item.product.salePrice,
      stock: item.product.stock,
      isMadeToOrder: item.product.isMadeToOrder,
      image: item.product.images[0]?.url ?? '/images/mock1.jpg',
    },
    variant: item.variant,
  })) ?? []
}