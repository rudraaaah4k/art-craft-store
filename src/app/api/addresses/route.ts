import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addressSchema } from '@/lib/validation'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  return NextResponse.json(await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] }))
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const parsed = addressSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid address.' }, { status: 400 })
  const address = await prisma.$transaction(async (transaction) => {
    if (parsed.data.isDefault) await transaction.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
    return transaction.address.create({ data: { ...parsed.data, line2: parsed.data.line2 || null, label: parsed.data.label || null, userId: session.user.id } })
  })
  return NextResponse.json(address, { status: 201 })
}