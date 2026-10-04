import { expect, test } from '@playwright/test'
import { prisma } from '../src/lib/prisma'
import { loginAsAdmin } from './fixtures'

const fixtureImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')

test('admin creates a product with an image and variant, then persists edits', async ({ page }) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const title = `Playwright Catalog ${suffix}`
  const editedTitle = `${title} Edited`
  const slug = `playwright-catalog-${suffix}`

  try {
    await loginAsAdmin(page)
    await page.waitForSelector('#product-category option:nth-child(2)')
    await page.locator('#product-title').fill(title)
    await page.locator('#product-slug').fill(slug)
    await page.locator('#product-sku').fill(`PW-${suffix}`)
    await page.locator('#product-category').selectOption({ index: 1 })
    await page.locator('#product-description').fill('Playwright catalog product')
    await page.locator('#product-price').fill('1250')
    await page.locator('#product-stock').fill('0')
    await page.locator('#product-weight').fill('500')
    await page.locator('#product-lengthCm').fill('20')
    await page.locator('#product-widthCm').fill('18')
    await page.locator('#product-heightCm').fill('6')
    await page.locator('input[type="file"]').setInputFiles({ name: 'playwright.png', mimeType: 'image/png', buffer: fixtureImage })
    await expect(page.getByRole('status')).toContainText('Image uploaded')
    await page.getByRole('button', { name: '+ Add variant' }).click()
    await page.locator('#variant-name-0').fill('Size')
    await page.locator('#variant-value-0').fill('Large')
    await page.locator('#variant-price-0').fill('1250')
    await page.locator('#variant-sku-0').fill(`PW-V-${suffix}`)
    await page.locator('#variant-stock-0').fill('4')
    await page.locator('#product-status').selectOption('PUBLISHED')
    await page.getByRole('button', { name: 'Create product' }).click()
    await expect(page.getByRole('status')).toContainText('Product saved')

    const productCard = page.locator('article').filter({ hasText: title }).first()
    await expect(productCard).toContainText('PUBLISHED')
    await productCard.getByRole('button', { name: 'Edit' }).click()
    await page.locator('#product-title').fill(editedTitle)
    await page.getByRole('button', { name: 'Update product' }).click()
    await expect(page.getByRole('status')).toContainText('Product saved')

    await page.reload()
    const editedCard = page.locator('article').filter({ hasText: editedTitle }).first()
    await editedCard.getByRole('button', { name: 'Edit' }).click()
    await expect(page.locator('#product-title')).toHaveValue(editedTitle)
    await expect(page.locator('#image-url-0')).not.toHaveValue('')
    await expect(page.locator('#variant-name-0')).toHaveValue('Size')
    await expect(page.locator('#variant-value-0')).toHaveValue('Large')
    await expect(page.locator('#variant-stock-0')).toHaveValue('4')
  } finally {
    await prisma.product.deleteMany({ where: { slug } })
  }
})
