import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const orders = await prisma.order.findMany({
    include: { payment: true },
    orderBy: { createdAt: 'desc' },
  })
  for (const o of orders) {
    console.log(JSON.stringify({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalPaise: o.totalPaise,
      paymentId: o.payment?.id ?? null,
      paymentStatus2: o.payment?.status ?? null,
      paymentAmountPaise: o.payment?.amountPaise ?? null,
      paymentMeta: o.payment?.metadata ?? null,
    }))
  }
  await prisma.$disconnect()
}
main().catch(console.error)
