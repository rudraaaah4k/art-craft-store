import { NextResponse } from 'next/server'
import { getRequestCart } from '@/lib/cart'
import { calculateCheckoutTotals } from '@/lib/checkout'
import { checkoutQuoteSchema } from '@/lib/validation'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'checkout-quote')) return NextResponse.json({ error: 'Too many checkout attempts. Try again later.' }, { status: 429 })
  const parsed = checkoutQuoteSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid checkout details.' }, { status: 400 })
  const { cart } = await getRequestCart()
  if (!cart || cart.items.length === 0) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  try {
    return NextResponse.json({ totals: await calculateCheckoutTotals(cart, parsed.data) })
  } catch {
    return NextResponse.json({ error: 'Unable to calculate checkout.' }, { status: 400 })
  }
}