import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { couponInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  return NextResponse.json(await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }))
}

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const parsed = couponInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  try {
    return NextResponse.json(await prisma.coupon.create({ data: { ...parsed.data, validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null } }), { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Coupon code already exists' }, { status: 409 })
  }
}
