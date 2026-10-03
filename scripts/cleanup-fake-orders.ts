import { prisma } from '../src/lib/prisma'

const FAKE_ORDER_IDS = [
  'cmuqqlemd0000wcvb8h2qykx4',  // pay_local_webhook_test_001
  'cmups9yv3000fvcvbw9yp2lmv',  // pay_test_replay
]

async function main() {
  for (const orderId of FAKE_ORDER_IDS) {
    // Delete payment first (FK constraint)
    const deletedPayment = await prisma.payment.deleteMany({ where: { orderId } })
    console.log(`Deleted ${deletedPayment.count} payment(s) for order ${orderId}`)

    // Delete order items
    const deletedItems = await prisma.orderItem.deleteMany({ where: { orderId } })
    console.log(`Deleted ${deletedItems.count} order item(s) for order ${orderId}`)

    // Delete stock reservations
    const deletedRes = await prisma.stockReservation.deleteMany({ where: { orderId } })
    console.log(`Deleted ${deletedRes.count} reservation(s) for order ${orderId}`)

    // Delete shipment
    const deletedShip = await prisma.shipment.deleteMany({ where: { orderId } })
    console.log(`Deleted ${deletedShip.count} shipment(s) for order ${orderId}`)

    // Delete the order itself
    try {
      await prisma.order.delete({ where: { id: orderId } })
      console.log(`Deleted order ${orderId}`)
    } catch (e) {
      console.log(`Order ${orderId} not found or already deleted:`, (e as Error).message)
    }
    console.log('---')
  }

  // Verify remaining orders
  const remaining = await prisma.order.findMany({
    include: { payment: { select: { providerPaymentId: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  })
  console.log('\nRemaining orders:')
  for (const o of remaining) {
    console.log(`  ${o.id} | status=${o.status} | paymentStatus=${o.paymentStatus} | providerPaymentId=${o.payment?.providerPaymentId ?? 'N/A'}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
