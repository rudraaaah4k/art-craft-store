import { createHmac } from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

const baseUrl = process.env.WEBHOOK_TEST_URL ?? 'http://localhost:3000'
const eventId = 'evt_local_payment_captured_001'
const externalOrderId = 'order_local_webhook_test_001'
const externalPaymentId = 'pay_local_webhook_test_001'

async function main() {
  if (!webhookSecret) throw new Error('RAZORPAY_WEBHOOK_SECRET is missing from .env.local')
  const { prisma } = await import('../src/lib/prisma')

  try {
  let order = await prisma.order.findFirst({ where: { email: 'webhook-test@example.com' }, orderBy: { createdAt: 'desc' }, include: { payment: true } })
  if (!order) {
    order = await prisma.order.create({
      data: {
        email: 'webhook-test@example.com',
        subtotalPaise: 94900,
        shippingPaise: 0,
        gstPaise: 10168,
        totalPaise: 94900,
        shippingFullName: 'Webhook Test Buyer',
        shippingPhone: '9000090000',
        shippingLine1: '1 Test Street',
        shippingCity: 'New Delhi',
        shippingState: 'Delhi',
        shippingPostalCode: '110001',
        items: {
          create: {
            title: 'Webhook Test Item',
            quantity: 1,
            unitPricePaise: 94900,
            gstPercent: 12,
            totalPaise: 94900,
          },
        },
        payment: {
          create: {
            provider: 'razorpay',
            amountPaise: 94900,
            status: 'PENDING',
            metadata: { externalOrderId },
          },
        },
      },
      include: { payment: true },
    })
  }

  const payload = {
    entity: 'event',
    account_id: 'acc_local_webhook_test',
    event: 'payment.captured',
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: externalPaymentId,
          entity: 'payment',
          amount: order.totalPaise,
          currency: 'INR',
          status: 'captured',
          order_id: externalOrderId,
          captured: true,
        },
      },
    },
    created_at: Math.floor(Date.now() / 1000),
  }
  const rawBody = JSON.stringify(payload)
  const signature = createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  async function postWebhook() {
    const response = await fetch(`${baseUrl}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature,
        'X-Razorpay-Event-Id': eventId,
      },
      body: rawBody,
    })
    return { status: response.status, body: await response.text() }
  }

  const first = await postWebhook()
  const afterFirst = await prisma.order.findUnique({ where: { id: order.id }, include: { payment: true } })
  const second = await postWebhook()
  const afterSecond = await prisma.order.findUnique({ where: { id: order.id }, include: { payment: true } })
  const eventCount = await prisma.webhookEvent.count({ where: { provider: 'razorpay', eventId } })
  const paymentCount = await prisma.payment.count({ where: { orderId: order.id } })

  console.log(JSON.stringify({
    orderId: order.id,
    signature: 'HMAC-SHA256 generated',
    first,
    afterFirst: { status: afterFirst?.status, paymentStatus: afterFirst?.paymentStatus, payment: afterFirst?.payment?.status },
    second,
    afterSecond: { status: afterSecond?.status, paymentStatus: afterSecond?.paymentStatus, payment: afterSecond?.payment?.status },
    eventCount,
    paymentCount,
    idempotent: second.status === 200 && second.body.includes('duplicate') && eventCount === 1 && paymentCount === 1,
  }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})