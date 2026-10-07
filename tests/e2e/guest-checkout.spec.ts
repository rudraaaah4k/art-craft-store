import { expect, test } from '@playwright/test'
import { prisma } from '../../src/lib/prisma'

test.describe('guest checkout with Razorpay TEST', () => {
  test('adds a product, completes card payment, and records a paid order', async ({ page }) => {
    test.skip(
      !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET,
      'Set Razorpay TEST credentials before running the real gateway flow.',
    )

    const product = await prisma.product.findFirst({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        OR: [{ stock: { gt: 0 }, variants: { none: {} } }, { variants: { some: { stock: { gt: 0 } } } }],
      },
      orderBy: { createdAt: 'asc' },
      include: { variants: { orderBy: { stock: 'desc' } } },
    })
    if (!product) throw new Error('No in-stock published product is available for checkout.')

    await page.goto(`/products/${product.slug}`)
    await page.getByRole('button', { name: 'Add to Cart' }).click()
    await expect(page.getByRole('status')).toContainText('Added to cart.')
    await page.goto('/checkout')

    await page.getByLabel('Email').fill('playwright-guest@example.com')
    await page.getByLabel('Full name').fill('Playwright Guest')
    await page.getByLabel('Phone').fill('9000090000')
    await page.getByLabel('Pincode').fill('110001')
    await page.getByLabel('City').fill('New Delhi')
    await page.getByLabel('State').fill('Delhi')
    await page.getByLabel('Address line 1').fill('1 Playwright Street')

    // Click "Place order" and wait for a successful order + Razorpay order creation.
    // On Neon free tier, the first attempt may fail with a transaction timeout, so we
    // retry up to 3 times.
    let orderId: string
    for (let attempt = 0; attempt < 3; attempt++) {
      const orderResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/checkout/orders'),
        { timeout: 45_000 },
      )

      // Dismiss any previous error alert before retrying
      if (attempt > 0) {
        await page.waitForTimeout(2000)
      }

      await page.getByRole('button', { name: 'Place order' }).click()
      const orderResponse = await orderResponsePromise

      if (orderResponse.status() === 201) {
        const orderData = await orderResponse.json()
        orderId = orderData.orderId

        // Wait for Razorpay order creation
        const paymentResponsePromise = page.waitForResponse(
          (response) => response.url().includes('/api/payments/razorpay/order') && response.status() === 200,
          { timeout: 45_000 },
        )
        await paymentResponsePromise
        break
      }

      // If last attempt also failed, throw
      if (attempt === 2) {
        throw new Error(`Order creation failed after 3 attempts (status ${orderResponse.status()})`)
      }
    }

    // Now simulate payment via webhook instead of interacting with Razorpay iframe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })

    if (!order || !order.payment) throw new Error('Order or Payment not found in DB')

    const { createHmac } = await import('node:crypto')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) throw new Error('RAZORPAY_WEBHOOK_SECRET is missing')

    const externalOrderId = (order.payment.metadata as Record<string, unknown>)?.externalOrderId as string
    if (!externalOrderId) throw new Error('externalOrderId missing from payment metadata')

    const payload = {
      entity: 'event',
      account_id: 'acc_local_webhook_test',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test_' + Date.now(),
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

    const webhookResponse = await page.request.post('/api/webhooks/razorpay', {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature,
        'X-Razorpay-Event-Id': 'evt_test_' + Date.now(),
      },
      data: rawBody,
    })
    expect(webhookResponse.ok()).toBeTruthy()

    // Navigate to the order page and verify it's confirmed/paid
    await page.goto(`/orders/${orderId}`)
    await expect(page.getByText('Order confirmed')).toBeVisible({ timeout: 15_000 })

    await expect.poll(
      async () => {
        const updatedOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: { paymentStatus: true },
        })
        return updatedOrder?.paymentStatus
      },
      { timeout: 15_000 },
    ).toBe('PAID')
  })
})
