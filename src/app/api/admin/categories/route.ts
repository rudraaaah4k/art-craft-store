import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { categoryInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  return NextResponse.json(await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } }))
}

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const parsed = categoryInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', fieldErrors: Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), i.message])) }, { status: 400 })
  try {
    return NextResponse.json(await prisma.category.create({ data: parsed.data }), { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Category slug already exists' }, { status: 409 })
  }
}
