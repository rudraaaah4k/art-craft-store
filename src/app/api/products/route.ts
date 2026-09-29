import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}
