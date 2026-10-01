import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addressSchema } from '@/lib/validation'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const parsed = addressSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid address.' }, { status: 400 })
  const { id } = await params
  const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Address not found.' }, { status: 404 })
  const address = await prisma.$transaction(async (transaction) => {
    if (parsed.data.isDefault) await transaction.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
    return transaction.address.update({ where: { id }, data: { ...parsed.data, line2: parsed.data.line2 || null, label: parsed.data.label || null } })
  })
  return NextResponse.json(address)
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { id } = await params
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}