import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { couponInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

type CouponContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: CouponContext) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const parsed = couponInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  const { id } = await params
  try {
    return NextResponse.json(await prisma.coupon.update({ where: { id }, data: { ...parsed.data, validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null } }))
  } catch {
    return NextResponse.json({ message: 'Coupon could not be updated' }, { status: 409 })
  }
}

export async function DELETE(_request: Request, { params }: CouponContext) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
