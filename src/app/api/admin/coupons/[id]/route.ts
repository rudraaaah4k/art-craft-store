import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { couponInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

type CouponContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: CouponContext) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const parsed = couponInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', fieldErrors: Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), i.message])) }, { status: 400 })
  const { id } = await params
  try {
    return NextResponse.json(await prisma.coupon.update({ where: { id }, data: { ...parsed.data, validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null } }))
  } catch {
    return NextResponse.json({ message: 'Coupon could not be updated' }, { status: 409 })
  }
}

export async function DELETE(_request: Request, { params }: CouponContext) {
  if (!await enforceRateLimit(_request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
