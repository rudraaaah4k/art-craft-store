import { expect, test } from '@playwright/test'
import { prisma } from '../src/lib/prisma'
import { createPaidOrderFixture, deletePaidOrderFixture, loginAsAdmin } from './fixtures'

test('admin issues a partial refund and blocks an over-refund', async ({ page }) => {
  const fixture = await createPaidOrderFixture('refund')
  try {
    await loginAsAdmin(page)
    await page.goto(`/admin/orders/${fixture.orderId}`)
    await expect(page.getByText(/Order .*CONFIRMED \/ PAID/)).toBeVisible()
    await page.getByRole('button', { name: 'Issue Refund' }).click()
    await page.getByLabel('Amount (₹)').fill('100')
    await page.getByRole('button', { name: 'Confirm refund' }).click()
    await expect(page.getByRole('status')).toContainText('Partial refund issued')
    await expect(page.getByText(/PARTIALLY_REFUNDED/)).toBeVisible()

    const paymentAfterPartial = await prisma.payment.findUnique({ where: { orderId: fixture.orderId } })
    expect(paymentAfterPartial?.status).toBe('PARTIALLY_REFUNDED')

    await page.getByRole('button', { name: 'Issue Refund' }).click()
    await page.getByLabel('Amount (₹)').fill('900.01')
    await page.getByRole('button', { name: 'Confirm refund' }).click()
    await expect(page.getByRole('alert')).toContainText('exceeds refundable balance')

    const paymentAfterOverRefund = await prisma.payment.findUnique({ where: { orderId: fixture.orderId } })
    expect(paymentAfterOverRefund?.status).toBe('PARTIALLY_REFUNDED')
  } finally {
    await deletePaidOrderFixture(fixture)
  }
})
