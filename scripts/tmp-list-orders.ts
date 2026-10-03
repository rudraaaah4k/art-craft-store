import { prisma } from '../src/lib/prisma'

async function main() {
  const orders = await prisma.order.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      paymentStatus: true,
      status: true,
      totalPaise: true,
      payment: { select: { status: true, amountPaise: true } },
    },
  })
  console.log(JSON.stringify({ count: await prisma.order.count(), orders }, null, 2))
}

main().finally(() => prisma.$disconnect())
