require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const p = await prisma.product.findMany({
    where: { slug: { in: ['studio-ghibli-wall-clock', 'seashell-decorative-tray', 'mushroom-brush-holder'] } },
    include: { images: true }
  });
  console.log(JSON.stringify(p.map(x => ({slug: x.slug, images: x.images})), null, 2));
}

run().finally(() => prisma.$disconnect());
