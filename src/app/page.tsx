import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { HomeScene } from '@/components/home/HomeScene'
import type { HomeProduct } from '@/components/home/StaticFallback'

export const metadata: Metadata = {
  title: 'Art & Craft Store | Authentic Handmade Indian Paintings & Decor',
  description:
    'Experience an interactive living gallery of authentic Indian craftsmanship. Handcrafted paintings, bespoke heritage decor, and artisan creations with nationwide shipping.',
}

export const revalidate = 60

export default async function HomePage() {
  // Fetch up to 12 published products with their images and category relations
  const [categories, rawProducts] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      take: 6,
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 2 },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ])

  // Normalize product data for serialization
  const products: HomeProduct[] = rawProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    images: p.images.map((img) => ({
      url: img.url,
      altText: img.altText,
    })),
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
  }))

  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <HomeScene products={products} categories={categories} />
    </main>
  )
}
