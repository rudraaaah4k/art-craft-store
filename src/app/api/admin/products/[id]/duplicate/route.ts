import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

type DuplicateContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: DuplicateContext) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const source = await prisma.product.findUnique({ where: { id }, include: { images: true, variants: true } })
  if (!source || source.deletedAt) return NextResponse.json({ message: 'Product not found' }, { status: 404 })

  const suffix = `copy-${Date.now()}`
  const product = await prisma.product.create({
    data: {
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-${suffix}`,
      description: source.description,
      categoryId: source.categoryId,
      sku: source.sku ? `${source.sku}-${suffix}` : null,
      price: source.price,
      salePrice: source.salePrice,
      gstPercent: source.gstPercent,
      stock: source.stock,
      weightGrams: source.weightGrams,
      lengthCm: source.lengthCm,
      widthCm: source.widthCm,
      heightCm: source.heightCm,
      processingDays: source.processingDays,
      isMadeToOrder: source.isMadeToOrder,
      codAllowed: source.codAllowed,
      status: 'DRAFT',
      metaTitle: source.metaTitle,
      metaDescription: source.metaDescription,
      images: { create: source.images.map(({ url, altText, sortOrder }) => ({ url, altText, sortOrder })) },
      variants: { create: source.variants.map(({ name, value, price, sku, stock }) => ({ name, value, price, sku, stock })) },
    },
    include: { category: true, images: true, variants: true },
  })
  return NextResponse.json(product, { status: 201 })
}
