require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const products = [
    { slug: 'studio-ghibli-wall-clock', file: 'ghibli-clock.jpg' },
    { slug: 'seashell-decorative-tray', file: 'seashell-tray.jpg' },
    { slug: 'mushroom-brush-holder', file: 'mushroom-brush-holder.jpg' }
  ];

  for (const { slug, file } of products) {
    const filePath = path.join(process.cwd(), 'public', 'images', file);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;

    const product = await prisma.product.findUnique({ where: { slug }, include: { images: true } });
    if (product && product.images.length > 0) {
      const imageId = product.images[0].id;
      await prisma.productImage.update({
        where: { id: imageId },
        data: { url: dataUri }
      });
      console.log(`Updated image for ${slug} to Data URI`);
    } else {
      console.error(`Product not found or has no images: ${slug}`);
    }
  }
}

run().finally(() => prisma.$disconnect());
