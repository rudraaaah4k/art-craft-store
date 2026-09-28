import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // 1. Create Admin
  const adminEmail = 'admin@artwebsite.com'
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  
  console.log(`Admin created/verified: ${admin.email}`)

  // 2. Create Categories
  const catPaintings = await prisma.category.upsert({
    where: { slug: 'paintings' },
    update: {},
    create: { name: 'Paintings', slug: 'paintings', description: 'Original Canvas Paintings' },
  })
  
  const catCrafts = await prisma.category.upsert({
    where: { slug: 'handicrafts' },
    update: {},
    create: { name: 'Handicrafts', slug: 'handicrafts', description: 'Handmade crafts and decors' },
  })

  const catDigital = await prisma.category.upsert({
    where: { slug: 'digital-art' },
    update: {},
    create: { name: 'Digital Art', slug: 'digital-art', description: 'Digital prints and illustrations' },
  })
  
  const categories = [catPaintings, catCrafts, catDigital]
  console.log(`Categories created.`)

  // 3. Create 12 Products with Variants
  const products = [
    {
      title: 'Sunset over Ocean', slug: 'sunset-over-ocean', price: 5000, categoryId: catPaintings.id, description: 'Beautiful sunset painting.', imageUrl: '/images/mock1.jpg',
      variants: [{ name: 'Size', value: 'Medium', price: 5000, stock: 5 }, { name: 'Size', value: 'Large', price: 8000, stock: 2 }]
    },
    {
      title: 'Abstract Geometric', slug: 'abstract-geometric', price: 4000, categoryId: catPaintings.id, description: 'Abstract painting with shapes.', imageUrl: '/images/mock2.jpg',
      variants: [{ name: 'Frame', value: 'Unframed', price: 4000, stock: 1 }, { name: 'Frame', value: 'Wooden Frame', price: 5500, stock: 1 }]
    },
    {
      title: 'Terracotta Vase', slug: 'terracotta-vase', price: 1500, categoryId: catCrafts.id, description: 'Handmade clay vase.', imageUrl: '/images/mock3.jpg',
      variants: [{ name: 'Color', value: 'Natural', price: 1500, stock: 10 }]
    },
    {
      title: 'Wooden Elephant', slug: 'wooden-elephant', price: 2500, categoryId: catCrafts.id, description: 'Carved wooden elephant decor.', imageUrl: '/images/mock4.jpg',
      variants: [{ name: 'Material', value: 'Teak', price: 2500, stock: 4 }]
    },
    {
      title: 'Macrame Wall Hanging', slug: 'macrame-wall-hanging', price: 1200, categoryId: catCrafts.id, description: 'Boho style macrame decor.', imageUrl: '/images/mock5.jpg',
      variants: [{ name: 'Size', value: 'Standard', price: 1200, stock: 15 }]
    },
    {
      title: 'Cyberpunk Cityscape', slug: 'cyberpunk-cityscape', price: 1000, categoryId: catDigital.id, description: 'High-res digital download.', imageUrl: '/images/mock6.jpg',
      variants: [{ name: 'Resolution', value: '4K', price: 1000, stock: 999 }, { name: 'Resolution', value: '8K', price: 1500, stock: 999 }]
    },
    {
      title: 'Floral Watercolor', slug: 'floral-watercolor', price: 3000, categoryId: catPaintings.id, description: 'Delicate floral painting.', imageUrl: '/images/mock7.jpg',
      variants: [{ name: 'Size', value: 'Small', price: 3000, stock: 1 }]
    },
    {
      title: 'Resin Ocean Coasters', slug: 'resin-ocean-coasters', price: 800, categoryId: catCrafts.id, description: 'Set of 4 resin coasters.', imageUrl: '/images/mock8.jpg',
      variants: [{ name: 'Pack', value: '4 pieces', price: 800, stock: 20 }]
    },
    {
      title: 'Minimalist Line Art', slug: 'minimalist-line-art', price: 600, categoryId: catDigital.id, description: 'Digital line art.', imageUrl: '/images/mock9.jpg',
      variants: [{ name: 'Type', value: 'Vector PDF', price: 600, stock: 999 }]
    },
    {
      title: 'Pottery Coffee Mug', slug: 'pottery-coffee-mug', price: 450, categoryId: catCrafts.id, description: 'Hand-thrown ceramic mug.', imageUrl: '/images/mock10.jpg',
      variants: [{ name: 'Color', value: 'Blue Glaze', price: 450, stock: 8 }, { name: 'Color', value: 'Earth Brown', price: 450, stock: 12 }]
    },
    {
      title: 'Mountain Oil Painting', slug: 'mountain-oil-painting', price: 12000, categoryId: catPaintings.id, description: 'Large mountain landscape.', imageUrl: '/images/mock11.jpg',
      variants: [{ name: 'Size', value: 'Extra Large', price: 12000, stock: 1 }]
    },
    {
      title: 'Vintage Sci-Fi Poster', slug: 'vintage-sci-fi-poster', price: 850, categoryId: catDigital.id, description: 'Retro futuristic poster design.', imageUrl: '/images/mock12.jpg',
      variants: [{ name: 'Resolution', value: 'High', price: 850, stock: 999 }]
    },
  ]

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      const createdProd = await prisma.product.create({
        data: {
          title: p.title,
          slug: p.slug,
          price: p.price,
          description: p.description,
          categoryId: p.categoryId,
          images: { create: [{ url: p.imageUrl, order: 0 }] },
          variants: {
            create: p.variants
          }
        }
      })
      console.log(`Created product: ${createdProd.title}`)
    } else {
      console.log(`Product already exists: ${existing.title}`)
    }
  }

  // 4. Create Coupons
  const coupon1 = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', discountValue: 10, maxUses: 100 },
  })
  
  const coupon2 = await prisma.coupon.upsert({
    where: { code: 'ARTFEST20' },
    update: {},
    create: { code: 'ARTFEST20', discountValue: 20, validUntil: new Date('2026-12-31') },
  })

  console.log(`Coupons created: ${coupon1.code}, ${coupon2.code}`)
  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
