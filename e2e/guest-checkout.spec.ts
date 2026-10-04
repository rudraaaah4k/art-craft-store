import { expect, test } from '@playwright/test'
import { prisma } from '../src/lib/prisma'

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
    await page.getByRole('button', { name: 'Place order' }).click()

    const checkout = page.frameLocator('iframe.razorpay-checkout-frame')
    await checkout.locator('input[name="card[number]"]').fill('4100 2800 0000 1007')
    await checkout.locator('input[name="card[expiry]"]').fill(process.env.RAZORPAY_TEST_EXPIRY || '12/30')
    await checkout.locator('input[name="card[cvv]"]').fill(process.env.RAZORPAY_TEST_CVV || '123')
    await checkout.getByRole('button', { name: /pay/i }).click()

    const otp = checkout.locator('input[placeholder*="OTP" i], input[name*="otp" i]').first()
    await otp.fill('1234')
    await checkout.getByRole('button', { name: /verify|pay/i }).click()

    await expect(page).toHaveURL(/\/orders\/[A-Za-z0-9]+$/, { timeout: 60_000 })
    await expect(page.getByText('Order confirmed')).toBeVisible()
    const orderId = new URL(page.url()).pathname.split('/').pop()
    expect(orderId).toBeTruthy()
    await expect.poll(async () => {
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } })
      return order?.paymentStatus
    }, { timeout: 30_000 }).toBe('PAID')
  })
})
