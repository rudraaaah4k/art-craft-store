import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { productInputSchema } from '@/lib/admin-schemas'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: { name: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const parsed = productInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', fieldErrors: Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), i.message])) }, { status: 400 })

  const input = parsed.data
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } })
  if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 400 })

  try {
    const product = await prisma.product.create({
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
        images: { create: input.images.map((image, sortOrder) => ({ ...image, sortOrder })) },
        variants: { create: input.variants.map(({ pricePaise, ...rest }) => ({ ...rest, price: pricePaise })) },
      },
      include: { category: true, images: true, variants: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (e) { console.error(e);
    return NextResponse.json({ message: 'Product could not be created', detail: 'Unknown error' }, { status: 409 })
  }
}
