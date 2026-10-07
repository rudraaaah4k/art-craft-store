import { expect, type Page } from '@playwright/test'
import { prisma } from '../../src/lib/prisma'

export const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@artwebsite.com'
export const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'admin123'

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login')
  await page.getByLabel('Email').fill(adminEmail)
  await page.getByLabel('Password').fill(adminPassword)

  // Wait for the NextAuth credentials API call to complete before expecting redirect
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/callback/credentials') &&
      response.status() === 200,
    { timeout: 30_000 },
  )
  await page.getByRole('button', { name: 'Login with Email' }).click()
  await responsePromise

  // The login page does router.push('/') after successful signIn — wait for it
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 })
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible()
}

export async function createPaidOrderFixture(label: string) {
  const category = await prisma.category.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!category) throw new Error('The test database has no category. Run the seed before Playwright tests.')

  const suffix = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const product = await prisma.product.create({
    data: {
      title: `Playwright ${label} product`,
      slug: `playwright-${suffix}`,
      description: 'A deterministic Playwright fixture product.',
      categoryId: category.id,
      sku: `PW-${suffix}`,
      price: 100000,
      gstPercent: 12,
      stock: 0,
      weightGrams: 500,
      lengthCm: 20,
      widthCm: 18,
      heightCm: 6,
      processingDays: 3,
      codAllowed: true,
      status: 'PUBLISHED',
      images: { create: [{ url: '/images/mock1.jpg', altText: 'Playwright fixture image' }] },
      variants: { create: [{ name: 'Size', value: 'Test', price: 100000, sku: `PW-V-${suffix}`, stock: 5 }] },
    },
    include: { variants: true },
  })

  await prisma.settings.upsert({
    where: { key: 'default' },
    create: {
      key: 'default',
      pickupName: 'ArtCraft Test Pickup',
      pickupEmail: 'pickup@example.com',
      pickupPhone: '9000090000',
      pickupAddressLine1: '1 Test Street',
      pickupCity: 'New Delhi',
      pickupState: 'Delhi',
      pickupPostalCode: '110001',
      pickupCountry: 'India',
    },
    update: {
      pickupName: 'ArtCraft Test Pickup',
      pickupEmail: 'pickup@example.com',
      pickupPhone: '9000090000',
      pickupAddressLine1: '1 Test Street',
      pickupCity: 'New Delhi',
      pickupState: 'Delhi',
      pickupPostalCode: '110001',
      pickupCountry: 'India',
    },
  })

  const order = await prisma.order.create({
    data: {
      email: `playwright-${suffix}@example.com`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotalPaise: 100000,
      totalPaise: 100000,
      gstPaise: 10714,
      shippingFullName: 'Playwright Buyer',
      shippingPhone: '9000090000',
      shippingLine1: '1 Test Street',
      shippingCity: 'New Delhi',
      shippingState: 'Delhi',
      shippingPostalCode: '110001',
      items: {
        create: {
          productId: product.id,
          variantId: product.variants[0].id,
          title: product.title,
          sku: product.variants[0].sku,
          quantity: 1,
          unitPricePaise: 100000,
          gstPercent: 12,
          totalPaise: 100000,
        },
      },
      payment: {
        create: {
          provider: 'mock',
          amountPaise: 100000,
          status: 'CAPTURED',
          metadata: { testFixture: true },
        },
      },
    },
  })

  return { orderId: order.id, productId: product.id, slug: product.slug }
}

export async function deletePaidOrderFixture(fixture: { orderId: string; productId: string }) {
  await prisma.order.delete({ where: { id: fixture.orderId } }).catch(() => undefined)
  await prisma.product.delete({ where: { id: fixture.productId } }).catch(() => undefined)
}
