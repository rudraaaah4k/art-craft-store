import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { categoryInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

type CategoryContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: CategoryContext) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const parsed = categoryInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  const { id } = await params
  try {
    return NextResponse.json(await prisma.category.update({ where: { id }, data: parsed.data }))
  } catch {
    return NextResponse.json({ message: 'Category could not be updated' }, { status: 409 })
  }
}

export async function DELETE(_request: Request, { params }: CategoryContext) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const count = await prisma.product.count({ where: { categoryId: id, deletedAt: null } })
  if (count > 0) return NextResponse.json({ message: 'Remove products from this category first' }, { status: 409 })
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
