import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Adding 3 new products...')

  // Get the Handicrafts category (these are all handmade art/craft items)
  const handicraftsCategory = await prisma.category.findUnique({ where: { slug: 'handicrafts' } })
  if (!handicraftsCategory) {
    throw new Error('Handicrafts category not found. Run seed first.')
  }

  const products = [
    {
      title: 'Studio Ghibli Themed Wall Clock',
      slug: 'studio-ghibli-wall-clock',
      sku: 'ART-CRAFT-006',
      description:
        'A beautifully handcrafted decorative wall clock inspired by the magical world of Studio Ghibli. This one-of-a-kind piece features adorable 3D characters from beloved Ghibli films — including Calcifer, Totoro, Kiki\'s Jiji, Soot Sprites, and more — arranged around a warm golden dial with embossed numerals. Each character is meticulously sculpted and painted by hand using air-dry clay and acrylic paints. Perfect for any anime lover\'s room or as a unique gift. Runs on a standard AA battery (not included). Diameter approx. 25 cm.',
      pricePaise: 249900,
      salePricePaise: null,
      gstPercent: 12,
      stock: 3,
      weightGrams: 800,
      lengthCm: 26,
      widthCm: 26,
      heightCm: 4,
      processingDays: 7,
      isMadeToOrder: true,
      codAllowed: true,
      status: 'PUBLISHED' as const,
      categoryId: handicraftsCategory.id,
      imageUrl: '/images/ghibli-clock.jpg',
      imageAlt: 'Handcrafted Studio Ghibli themed wall clock with 3D anime characters',
      variants: [
        { name: 'Style', value: 'Ghibli Characters', pricePaise: 249900, stock: 3 },
      ],
    },
    {
      title: 'Handmade Seashell Decorative Tray',
      slug: 'seashell-decorative-tray',
      sku: 'ART-CRAFT-007',
      description:
        'A stunning DIY-style seashell tray sculpted and painted by hand, featuring a beautiful mint green finish with elegant ruffled edges. This versatile decorative piece is perfect for holding jewelry, trinkets, crystals, or simply as a tabletop accent piece. The organic, ocean-inspired shape brings a coastal vibe to any room. Each tray is uniquely shaped, making no two pieces exactly alike. Crafted with premium air-dry clay, coated with a durable matte finish. Approx. dimensions: 15 cm × 12 cm.',
      pricePaise: 149900,
      salePricePaise: 129900,
      gstPercent: 12,
      stock: 5,
      weightGrams: 400,
      lengthCm: 15,
      widthCm: 12,
      heightCm: 5,
      processingDays: 5,
      isMadeToOrder: true,
      codAllowed: true,
      status: 'PUBLISHED' as const,
      categoryId: handicraftsCategory.id,
      imageUrl: '/images/seashell-tray.jpg',
      imageAlt: 'Handmade mint green seashell decorative tray for jewelry and trinkets',
      variants: [
        { name: 'Color', value: 'Mint Green', pricePaise: 149900, stock: 3 },
        { name: 'Color', value: 'Lavender', pricePaise: 149900, stock: 2 },
      ],
    },
    {
      title: 'Mushroom Pen & Brush Holder',
      slug: 'mushroom-brush-holder',
      sku: 'ART-CRAFT-008',
      description:
        'An adorable mushroom-shaped pen and brush holder, lovingly handcrafted from air-dry clay and painted with vibrant acrylics. The whimsical red-and-white spotted mushroom cap sits atop a mossy woodland base, creating a charming fairy-tale vibe for your desk or art station. Features 3-4 slots for pens, brushes, or styluses. Sealed with a protective matte varnish for durability. A delightful gift for artists, students, or anyone who loves cottagecore aesthetics. Height approx. 10 cm, base diameter approx. 7 cm.',
      pricePaise: 99900,
      salePricePaise: null,
      gstPercent: 12,
      stock: 8,
      weightGrams: 350,
      lengthCm: 7,
      widthCm: 7,
      heightCm: 10,
      processingDays: 5,
      isMadeToOrder: false,
      codAllowed: true,
      status: 'PUBLISHED' as const,
      categoryId: handicraftsCategory.id,
      imageUrl: '/images/mushroom-brush-holder.jpg',
      imageAlt: 'Handcrafted mushroom-shaped pen and brush holder with red spotted cap',
      variants: [
        { name: 'Type', value: 'Red Mushroom', pricePaise: 99900, stock: 5 },
        { name: 'Type', value: 'Brown Mushroom', pricePaise: 99900, stock: 3 },
      ],
    },
  ]

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        sku: product.sku,
        price: product.pricePaise,
        salePrice: product.salePricePaise,
        description: product.description,
        gstPercent: product.gstPercent,
        stock: product.stock,
        weightGrams: product.weightGrams,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        processingDays: product.processingDays,
        isMadeToOrder: product.isMadeToOrder,
        codAllowed: product.codAllowed,
        status: product.status,
        categoryId: product.categoryId,
        images: { deleteMany: {}, create: [{ url: product.imageUrl, altText: product.imageAlt, sortOrder: 0 }] },
        variants: {
          deleteMany: {},
          create: product.variants.map((v) => ({
            name: v.name,
            value: v.value,
            price: v.pricePaise,
            stock: v.stock,
          })),
        },
      },
      create: {
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        price: product.pricePaise,
        salePrice: product.salePricePaise,
        description: product.description,
        gstPercent: product.gstPercent,
        stock: product.stock,
        weightGrams: product.weightGrams,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        processingDays: product.processingDays,
        isMadeToOrder: product.isMadeToOrder,
        codAllowed: product.codAllowed,
        status: product.status,
        categoryId: product.categoryId,
        images: { create: [{ url: product.imageUrl, altText: product.imageAlt, sortOrder: 0 }] },
        variants: {
          create: product.variants.map((v) => ({
            name: v.name,
            value: v.value,
            price: v.pricePaise,
            stock: v.stock,
          })),
        },
      },
    })
    console.log(`✅ ${created.title} (${created.slug}) — ₹${(created.price / 100).toFixed(2)}`)
  }

  console.log('\nDone! All 3 products added to the database.')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
