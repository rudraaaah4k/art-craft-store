import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

const products = [
  {
    title: 'Sunset over Ocean', slug: 'sunset-over-ocean', sku: 'ART-PAINT-001', pricePaise: 500000, category: 'paintings', description: 'Beautiful sunset painting.', imageUrl: '/images/mock1.jpg', stock: 5, weightGrams: 1200, variants: [{ name: 'Size', value: 'Medium', pricePaise: 500000, stock: 5 }, { name: 'Size', value: 'Large', pricePaise: 800000, stock: 2 }],
  },
  {
    title: 'Abstract Geometric', slug: 'abstract-geometric', sku: 'ART-PAINT-002', pricePaise: 400000, category: 'paintings', description: 'Abstract painting with shapes.', imageUrl: '/images/mock2.jpg', stock: 1, weightGrams: 1000, variants: [{ name: 'Frame', value: 'Unframed', pricePaise: 400000, stock: 1 }, { name: 'Frame', value: 'Wooden Frame', pricePaise: 550000, stock: 1 }],
  },
  {
    title: 'Terracotta Vase', slug: 'terracotta-vase', sku: 'ART-CRAFT-001', pricePaise: 150000, category: 'handicrafts', description: 'Handmade clay vase.', imageUrl: '/images/mock3.jpg', stock: 10, weightGrams: 900, variants: [{ name: 'Color', value: 'Natural', pricePaise: 150000, stock: 10 }],
  },
  {
    title: 'Wooden Elephant', slug: 'wooden-elephant', sku: 'ART-CRAFT-002', pricePaise: 250000, category: 'handicrafts', description: 'Carved wooden elephant decor.', imageUrl: '/images/mock4.jpg', stock: 4, weightGrams: 700, variants: [{ name: 'Material', value: 'Teak', pricePaise: 250000, stock: 4 }],
  },
  {
    title: 'Macrame Wall Hanging', slug: 'macrame-wall-hanging', sku: 'ART-CRAFT-003', pricePaise: 120000, category: 'handicrafts', description: 'Boho style macrame decor.', imageUrl: '/images/mock5.jpg', stock: 15, weightGrams: 500, variants: [{ name: 'Size', value: 'Standard', pricePaise: 120000, stock: 15 }],
  },
  {
    title: 'Cyberpunk Cityscape', slug: 'cyberpunk-cityscape', sku: 'ART-DIGITAL-001', pricePaise: 100000, category: 'digital-art', description: 'High-res digital download.', imageUrl: '/images/mock6.jpg', stock: 999, weightGrams: 0, variants: [{ name: 'Resolution', value: '4K', pricePaise: 100000, stock: 999 }, { name: 'Resolution', value: '8K', pricePaise: 150000, stock: 999 }],
  },
  {
    title: 'Floral Watercolor', slug: 'floral-watercolor', sku: 'ART-PAINT-003', pricePaise: 300000, category: 'paintings', description: 'Delicate floral painting.', imageUrl: '/images/mock7.jpg', stock: 1, weightGrams: 600, variants: [{ name: 'Size', value: 'Small', pricePaise: 300000, stock: 1 }],
  },
  {
    title: 'Resin Ocean Coasters', slug: 'resin-ocean-coasters', sku: 'ART-CRAFT-004', pricePaise: 80000, category: 'handicrafts', description: 'Set of 4 resin coasters.', imageUrl: '/images/mock8.jpg', stock: 20, weightGrams: 450, variants: [{ name: 'Pack', value: '4 pieces', pricePaise: 80000, stock: 20 }],
  },
  {
    title: 'Minimalist Line Art', slug: 'minimalist-line-art', sku: 'ART-DIGITAL-002', pricePaise: 60000, category: 'digital-art', description: 'Digital line art.', imageUrl: '/images/mock9.jpg', stock: 999, weightGrams: 0, variants: [{ name: 'Type', value: 'Vector PDF', pricePaise: 60000, stock: 999 }],
  },
  {
    title: 'Pottery Coffee Mug', slug: 'pottery-coffee-mug', sku: 'ART-CRAFT-005', pricePaise: 45000, category: 'handicrafts', description: 'Hand-thrown ceramic mug.', imageUrl: '/images/mock10.jpg', stock: 8, weightGrams: 350, variants: [{ name: 'Color', value: 'Blue Glaze', pricePaise: 45000, stock: 8 }, { name: 'Color', value: 'Earth Brown', pricePaise: 45000, stock: 12 }],
  },
  {
    title: 'Mountain Oil Painting', slug: 'mountain-oil-painting', sku: 'ART-PAINT-004', pricePaise: 1200000, category: 'paintings', description: 'Large mountain landscape.', imageUrl: '/images/mock11.jpg', stock: 1, weightGrams: 2200, variants: [{ name: 'Size', value: 'Extra Large', pricePaise: 1200000, stock: 1 }],
  },
  {
    title: 'Vintage Sci-Fi Poster', slug: 'vintage-sci-fi-poster', sku: 'ART-DIGITAL-003', pricePaise: 85000, category: 'digital-art', description: 'Retro futuristic poster design.', imageUrl: '/images/mock12.jpg', stock: 999, weightGrams: 0, variants: [{ name: 'Resolution', value: 'High', pricePaise: 85000, stock: 999 }],
  },
] as const

async function main() {
  console.log('Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@artwebsite.com' },
    update: { name: 'Admin User', password: adminPassword, role: 'ADMIN', emailVerified: new Date() },
    create: { email: 'admin@artwebsite.com', name: 'Admin User', password: adminPassword, role: 'ADMIN', emailVerified: new Date() },
  })
  console.log(`Admin created/verified: ${admin.email}`)

  const categoryData = [
    { name: 'Paintings', slug: 'paintings', description: 'Original Canvas Paintings' },
    { name: 'Handicrafts', slug: 'handicrafts', description: 'Handmade crafts and decors' },
    { name: 'Digital Art', slug: 'digital-art', description: 'Digital prints and illustrations' },
  ]
  const categories = new Map<string, string>()
  for (const category of categoryData) {
    const saved = await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category })
    categories.set(saved.slug, saved.id)
  }

  for (const product of products) {
    const categoryId = categories.get(product.category)
    if (!categoryId) throw new Error(`Missing category: ${product.category}`)

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        sku: product.sku,
        price: product.pricePaise,
        salePrice: null,
        description: product.description,
        gstPercent: 12,
        stock: product.stock,
        weightGrams: product.weightGrams,
        processingDays: 3,
        isMadeToOrder: false,
        codAllowed: true,
        status: 'PUBLISHED',
        categoryId,
        images: { deleteMany: {}, create: [{ url: product.imageUrl, sortOrder: 0 }] },
        variants: { deleteMany: {}, create: product.variants.map((variant) => ({ name: variant.name, value: variant.value, price: variant.pricePaise, stock: variant.stock })) },
      },
      create: {
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        price: product.pricePaise,
        description: product.description,
        gstPercent: 12,
        stock: product.stock,
        weightGrams: product.weightGrams,
        processingDays: 3,
        isMadeToOrder: false,
        codAllowed: true,
        status: 'PUBLISHED',
        categoryId,
        images: { create: [{ url: product.imageUrl, sortOrder: 0 }] },
        variants: { create: product.variants.map((variant) => ({ name: variant.name, value: variant.value, price: variant.pricePaise, stock: variant.stock })) },
      },
    })
  }

  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: { type: 'PERCENT', discountValue: 10, maxUses: 100 }, create: { code: 'WELCOME10', type: 'PERCENT', discountValue: 10, maxUses: 100 } })
  await prisma.coupon.upsert({ where: { code: 'ARTFEST20' }, update: { type: 'PERCENT', discountValue: 20, validUntil: new Date('2026-12-31') }, create: { code: 'ARTFEST20', type: 'PERCENT', discountValue: 20, validUntil: new Date('2026-12-31') } })
  await prisma.settings.upsert({ where: { key: 'default' }, update: {}, create: { key: 'default' } })

  console.log('Seeded 12 products, 3 categories, 2 coupons, and default settings.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })