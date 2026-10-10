import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { productInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

type ProductRouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: ProductRouteContext) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true, images: { orderBy: { sortOrder: 'asc' } }, variants: true } })
  if (!product || product.deletedAt) return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(request: Request, { params }: ProductRouteContext) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = productInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', fieldErrors: Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), i.message])) }, { status: 400 })
  const input = parsed.data

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        categoryId: input.categoryId,
        sku: input.sku,
        price: input.pricePaise,
        salePrice: input.salePricePaise,
        gstPercent: input.gstPercent,
        stock: input.stock,
        weightGrams: input.weightGrams,
        lengthCm: input.lengthCm,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        processingDays: input.processingDays,
        isMadeToOrder: input.isMadeToOrder,
        codAllowed: input.codAllowed,
        status: input.status,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        images: { deleteMany: {}, create: input.images.map((image, sortOrder) => ({ ...image, sortOrder })) },
        variants: { deleteMany: {}, create: input.variants.map(({ pricePaise, ...rest }) => ({ ...rest, price: pricePaise })) },
      },
      include: { category: true, images: true, variants: true },
    })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ message: 'Product could not be updated', detail: 'Unknown error' }, { status: 409 })
  }
}

export async function DELETE(_request: Request, { params }: ProductRouteContext) {
  if (!await enforceRateLimit(_request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } })

  if (orderItemCount > 0) {
    const product = await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: 'DRAFT' } })
    return NextResponse.json({ product, softDeleted: true })
  }

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ deleted: true, softDeleted: false })
}
