import { expect, test } from '@playwright/test'
import { prisma } from '../../src/lib/prisma'
import { createPaidOrderFixture, deletePaidOrderFixture, loginAsAdmin } from './fixtures'

test('admin creates a mock shipment and sees AWB, label, and status', async ({ page }) => {
  const fixture = await createPaidOrderFixture('shipment')
  try {
    await loginAsAdmin(page)
    await page.goto('/admin/orders')
    const orderCard = page.locator('article').filter({ hasText: fixture.orderId }).first()
    await orderCard.getByRole('link', { name: 'View order' }).click()
    await expect(page).toHaveURL(new RegExp(`/admin/orders/${fixture.orderId}$`))
    await page.goto('/admin/orders')
    const listCard = page.locator('article').filter({ hasText: fixture.orderId }).first()
    await listCard.getByRole('button', { name: 'Create Shipment' }).click()
    await expect(listCard.getByText('Choose a mock courier')).toBeVisible()
    await listCard.locator('input[type="radio"]').first().check()
    await listCard.getByRole('button', { name: /Create mock shipment/ }).click()
    await expect(page.getByRole('status')).toContainText('Mock shipment created. AWB MOCK')

    await page.goto(`/admin/orders/${fixture.orderId}`)
    await expect(page.getByText(/Shipment PACKED/)).toBeVisible()
    await expect(page.getByText(/AWB MOCK/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download mock label' })).toBeVisible()

    const shipment = await prisma.shipment.findUnique({ where: { orderId: fixture.orderId } })
    expect(shipment?.trackingNumber).toMatch(/^MOCK/)
    expect(shipment?.labelUrl).toBeTruthy()
    expect(shipment?.status).toBe('PACKED')
  } finally {
    await deletePaidOrderFixture(fixture)
  }
})
