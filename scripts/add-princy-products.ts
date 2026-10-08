import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Adding Princy\\'s products to the database...')

  const handicraftsCategory = await prisma.category.findUnique({
    where: { slug: 'handicrafts' }
  })

  if (!handicraftsCategory) {
    throw new Error("Handicrafts category not found! Please run the seed script first.")
  }

  const products = [
    {
      title: 'Whimsical Toadstool Paint Brush Holder',
      slug: 'whimsical-toadstool-paint-brush-holder',
      sku: 'ART-CRAFT-005',
      price: 45000, // 450 INR
      description: 'Artist: Princy\n\nKeep your creative space magical and organized with this handmade toadstool paint brush holder. Sculpted and painted entirely by hand, it features a classic bright red cap with white polka dots and a sturdy green moss-like base. The perfectly sized holes keep your favorite detailing brushes upright, preventing damaged bristles and keeping your desk aesthetic.',
      gstPercent: 12,
      stock: 5,
      weightGrams: 300,
      processingDays: 3,
      isMadeToOrder: false,
      codAllowed: true,
      status: 'PUBLISHED',
      categoryId: handicraftsCategory.id,
      imageUrl: '/images/princy-mushroom.jpg',
      variants: [{ name: 'Type', value: 'Standard', price: 45000, stock: 5 }]
    },
    {
      title: 'Studio Ghibli Inspired Hand-Sculpted Wall Clock',
      slug: 'studio-ghibli-wall-clock',
      sku: 'ART-CRAFT-006',
      price: 149900, // 1499 INR
      description: 'Artist: Princy\n\nBring the magic of Hayao Miyazaki\\'s worlds into your room! This unique handmade wall clock features meticulously sculpted clay figures replacing traditional numbers. Spot your favorite characters from My Neighbor Totoro, Spirited Away, Howl\\'s Moving Castle, and Kiki\\'s Delivery Service. Each piece is hand-painted and glazed, making this clock a perfect statement piece or gift for any anime lover.',
      gstPercent: 12,
      stock: 2,
      weightGrams: 800,
      processingDays: 5,
      isMadeToOrder: false,
      codAllowed: true,
      status: 'PUBLISHED',
      categoryId: handicraftsCategory.id,
      imageUrl: '/images/princy-clock.jpg',
      variants: [{ name: 'Theme', value: 'Ghibli Mix', price: 149900, stock: 2 }]
    },
    {
      title: 'Mint Green Aesthetic Seashell Jewelry Tray',
      slug: 'mint-green-seashell-jewelry-tray',
      sku: 'ART-CRAFT-007',
      price: 35000, // 350 INR
      description: 'Artist: Princy\n\nAdd a touch of coastal elegance to your vanity with this repurposed seashell jewelry tray. Hand-painted in a soothing, glossy mint green finish, its natural ridges make it the perfect aesthetic catch-all for your bracelets, rings, earrings, or small trinkets. A beautiful and sustainable way to organize your daily wear jewelry.',
      gstPercent: 12,
      stock: 10,
      weightGrams: 150,
      processingDays: 2,
      isMadeToOrder: false,
      codAllowed: true,
      status: 'PUBLISHED',
      categoryId: handicraftsCategory.id,
      imageUrl: '/images/princy-tray.jpg',
      variants: [{ name: 'Color', value: 'Mint Green', price: 35000, stock: 10 }]
    }
  ]

  for (const product of products) {
    const { imageUrl, variants, ...productData } = product

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...productData,
        images: { deleteMany: {}, create: [{ url: imageUrl, sortOrder: 0 }] },
        variants: { deleteMany: {}, create: variants }
      },
      create: {
        ...productData,
        images: { create: [{ url: imageUrl, sortOrder: 0 }] },
        variants: { create: variants }
      }
    })
    console.log(`Inserted: ${product.title}`)
  }

  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
