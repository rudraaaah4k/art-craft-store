# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-product.spec.ts >> admin creates a product with an image and variant, then persists edits
- Location: tests\e2e\admin-product.spec.ts:7:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "Image uploaded"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByRole('status') with timeout 10000ms
  - waiting for getByRole('status')

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "ArtCraft":
    - /url: /
  - navigation "Main navigation":
    - link "Home":
      - /url: /
    - link "Shop":
      - /url: /shop
    - link "About":
      - /url: /about
    - link "Contact":
      - /url: /contact
  - textbox "Search products":
    - /placeholder: Search...
  - button "Search":
    - img
  - link "Shopping Cart":
    - /url: /cart
    - img
    - text: "2"
  - button "User Account":
    - img
- main:
  - paragraph: Art & craft studio
  - heading "Admin workspace" [level=1]
  - paragraph: Admin User
  - link "View shop":
    - /url: /
  - complementary:
    - navigation "Admin navigation":
      - link "Dashboard":
        - /url: /admin/dashboard
      - link "Catalog":
        - /url: /admin
      - link "Orders":
        - /url: /admin/orders
      - link "Customers":
        - /url: /admin/customers
      - link "Reports":
        - /url: /admin/reports
      - link "Settings":
        - /url: /admin/shipping
  - main:
    - paragraph: Control room
    - heading "Catalog" [level=2]
    - paragraph: Keep the shop accurate, calm, and ready to sell.
    - text: Help
    - button "products"
    - button "categories"
    - button "coupons"
    - heading "Products Published products appear in the public product query; drafts remain admin-only." [level=3]: Products ?
    - text: 15 items
    - article:
      - img "Handcrafted mushroom-shaped pen and brush holder with red spotted cap"
      - heading "Mushroom Pen & Brush Holder" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-008 · ₹999.00
      - paragraph: 2 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Handmade mint green seashell decorative tray for jewelry and trinkets"
      - heading "Handmade Seashell Decorative Tray" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-007 · ₹1499.00
      - paragraph: 2 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Handcrafted Studio Ghibli themed wall clock with 3D anime characters"
      - heading "Studio Ghibli Themed Wall Clock" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-006 · ₹2499.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Vintage Sci-Fi Poster"
      - heading "Vintage Sci-Fi Poster" [level=4]
      - text: PUBLISHED
      - paragraph: Digital Art · SKU ART-DIGITAL-003 · ₹850.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Mountain Oil Painting"
      - heading "Mountain Oil Painting" [level=4]
      - text: PUBLISHED
      - paragraph: Paintings · SKU ART-PAINT-004 · ₹12000.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Pottery Coffee Mug"
      - heading "Pottery Coffee Mug" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-005 · ₹450.00
      - paragraph: 2 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Minimalist Line Art"
      - heading "Minimalist Line Art" [level=4]
      - text: PUBLISHED
      - paragraph: Digital Art · SKU ART-DIGITAL-002 · ₹600.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Resin Ocean Coasters"
      - heading "Resin Ocean Coasters" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-004 · ₹800.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Floral Watercolor"
      - heading "Floral Watercolor" [level=4]
      - text: PUBLISHED
      - paragraph: Paintings · SKU ART-PAINT-003 · ₹3000.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Cyberpunk Cityscape"
      - heading "Cyberpunk Cityscape" [level=4]
      - text: PUBLISHED
      - paragraph: Digital Art · SKU ART-DIGITAL-001 · ₹1000.00
      - paragraph: 2 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Macrame Wall Hanging"
      - heading "Macrame Wall Hanging" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-003 · ₹1200.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Wooden Elephant"
      - heading "Wooden Elephant" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-002 · ₹2500.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Terracotta Vase"
      - heading "Terracotta Vase" [level=4]
      - text: PUBLISHED
      - paragraph: Handicrafts · SKU ART-CRAFT-001 · ₹1500.00
      - paragraph: 1 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Abstract Geometric"
      - heading "Abstract Geometric" [level=4]
      - text: PUBLISHED
      - paragraph: Paintings · SKU ART-PAINT-002 · ₹4000.00
      - paragraph: 2 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - article:
      - img "Sunset over Ocean"
      - heading "Sunset over Ocean" [level=4]
      - text: PUBLISHED
      - paragraph: Paintings · SKU ART-PAINT-001 · ₹5000.00
      - paragraph: 2 variants · 1 images
      - button "Edit"
      - button "Duplicate"
      - button "Delete"
    - heading "New product Prices are entered in rupees here and stored as integer paise on the server." [level=3]: New product ?
    - text: Product Title ?
    - textbox "Product Title The main display name for this product in the shop.":
      - /placeholder: Hand-painted monsoon
      - text: Playwright Catalog 1791650916641-wlpti6
    - text: Slug
    - textbox "Slug":
      - /placeholder: hand-painted-monsoon
      - text: playwright-catalog-1791650916641-wlpti6
    - text: SKU
    - textbox "SKU":
      - /placeholder: ART-PAINT-013
      - text: PW-1791650916641-wlpti6
    - text: Category
    - combobox "Category":
      - option "Choose a category"
      - option "Digital Art" [selected]
      - option "Handicrafts"
      - option "Paintings"
    - text: Description
    - textbox "Description": Playwright catalog product
    - text: Price (₹)
    - spinbutton "Price (₹)": "1250"
    - text: Sale price (₹)
    - spinbutton "Sale price (₹)"
    - text: GST % ?
    - spinbutton "GST % GST percentage for this product. Default is 12%.": "12"
    - text: Stock ?
    - spinbutton "Stock For products without variants, stock is tracked here. With variants, each variant has its own stock.": "0"
    - text: Weight (g) ?
    - spinbutton "Weight (g) Weight in grams, required for shipping rate calculation.": "500"
    - text: Processing days ?
    - spinbutton "Processing days Days needed to prepare the item before dispatch. Added to delivery ETA.": "3"
    - text: length cm
    - spinbutton "length cm": "20"
    - text: width cm
    - spinbutton "width cm": "18"
    - text: height cm
    - spinbutton "height cm": "6"
    - checkbox "Made to order Made-to-order items are prepaid only and non-returnable."
    - text: Made to order ?
    - checkbox "COD allowed Allow cash-on-delivery for this product. Disabled for made-to-order items." [checked]
    - text: COD allowed ? Status
    - combobox "Status":
      - option "Draft" [selected]
      - option "Published"
    - heading "Images The first image is the cover. Drag rows or use arrows to reorder." [level=4]: Images ?
    - text: Upload mock/Cloudinary
    - alert: Cloudinary is not configured — using a placeholder image. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for real uploads.
    - text: ⠿
    - textbox "Image URL": https://placehold.co/800x800/e8dcc8/6f6255?text=playwright.png
    - textbox "Alt text": playwright.png
    - button "↑"
    - button "↓"
    - button "×"
    - button "+ Add image URL"
    - heading "Variants Variant products reserve and sell stock from each selected Variant.stock." [level=4]: Variants ?
    - button "+ Add variant"
    - text: SEO Meta Title ?
    - textbox "SEO Meta Title The title that appears in search engine results. Different from the product display name.":
      - /placeholder: Buy Hand-painted Monsoon Art Online
    - text: SEO Meta Description
    - textbox "SEO Meta Description":
      - /placeholder: Handcrafted art piece depicting the monsoon season in India...
    - button "Create product"
- contentinfo:
  - heading "ArtCraft" [level=3]
  - paragraph: Curated handmade art, crafts, and digital prints from skilled artisans across India. Authentic, premium, and lovingly crafted.
  - heading "Shop" [level=4]
  - list:
    - listitem:
      - link "All Products":
        - /url: /shop
    - listitem:
      - link "Paintings":
        - /url: /shop?category=paintings
    - listitem:
      - link "Handicrafts":
        - /url: /shop?category=handicrafts
    - listitem:
      - link "Digital Art":
        - /url: /shop?category=digital-art
  - heading "Help" [level=4]
  - list:
    - listitem:
      - link "Contact Us":
        - /url: /contact
    - listitem:
      - link "Shipping Policy":
        - /url: /shipping-policy
    - listitem:
      - link "Return & Refund":
        - /url: /return-policy
    - listitem:
      - link "About Us":
        - /url: /about
  - heading "Legal" [level=4]
  - list:
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy-policy
    - listitem:
      - link "Terms of Service":
        - /url: /terms
  - paragraph: © 2026 ArtCraft Store. All rights reserved.
- alert
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | import { prisma } from '../../src/lib/prisma'
  3  | import { loginAsAdmin } from './fixtures'
  4  | 
  5  | const fixtureImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  6  | 
  7  | test('admin creates a product with an image and variant, then persists edits', async ({ page }) => {
  8  |   test.setTimeout(180_000)
  9  |   const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  10 |   const title = `Playwright Catalog ${suffix}`
  11 |   const editedTitle = `${title} Edited`
  12 |   const slug = `playwright-catalog-${suffix}`
  13 | 
  14 |   try {
  15 |     await loginAsAdmin(page)
  16 |     await page.waitForSelector('#product-category option:nth-child(2)', { state: 'attached' })
  17 |     await page.locator('#product-title').fill(title)
  18 |     await page.locator('#product-slug').fill(slug)
  19 |     await page.locator('#product-sku').fill(`PW-${suffix}`)
  20 |     await page.locator('#product-category').selectOption({ index: 1 })
  21 |     await page.locator('#product-description').fill('Playwright catalog product')
  22 |     await page.locator('#product-price').fill('1250')
  23 |     await page.locator('#product-stock').fill('0')
  24 |     await page.locator('#product-weight').fill('500')
  25 |     await page.locator('#product-lengthCm').fill('20')
  26 |     await page.locator('#product-widthCm').fill('18')
  27 |     await page.locator('#product-heightCm').fill('6')
  28 |     await page.locator('input[type="file"]').setInputFiles({ name: 'playwright.png', mimeType: 'image/png', buffer: fixtureImage })
> 29 |     await expect(page.getByRole('status')).toContainText('Image uploaded')
     |                                            ^ Error: expect(locator).toContainText(expected) failed
  30 |     await page.getByRole('button', { name: '+ Add variant' }).click()
  31 |     await page.locator('#variant-name-0').fill('Size')
  32 |     await page.locator('#variant-value-0').fill('Large')
  33 |     await page.locator('#variant-price-0').fill('1250')
  34 |     await page.locator('#variant-sku-0').fill(`PW-V-${suffix}`)
  35 |     await page.locator('#variant-stock-0').fill('4')
  36 |     await page.locator('#product-status').selectOption('PUBLISHED')
  37 |     await page.getByRole('button', { name: 'Create product' }).click()
  38 |     await expect(page.getByRole('status')).toContainText('Product saved', { timeout: 30_000 })
  39 | 
  40 |     const productCard = page.locator('article').filter({ hasText: title }).first()
  41 |     await expect(productCard).toContainText('PUBLISHED')
  42 |     await productCard.getByRole('button', { name: 'Edit' }).click()
  43 |     await page.locator('#product-title').fill(editedTitle)
  44 |     await page.getByRole('button', { name: 'Update product' }).click()
  45 |     await expect(page.getByRole('status')).toContainText('Product saved', { timeout: 30_000 })
  46 | 
  47 |     await page.reload()
  48 |     const editedCard = page.locator('article').filter({ hasText: editedTitle }).first()
  49 |     await editedCard.getByRole('button', { name: 'Edit' }).click()
  50 |     await expect(page.locator('#product-title')).toHaveValue(editedTitle)
  51 |     await expect(page.locator('#image-url-0')).not.toHaveValue('')
  52 |     await expect(page.locator('#variant-name-0')).toHaveValue('Size')
  53 |     await expect(page.locator('#variant-value-0')).toHaveValue('Large')
  54 |     await expect(page.locator('#variant-stock-0')).toHaveValue('4')
  55 |   } finally {
  56 |     await prisma.product.deleteMany({ where: { slug } })
  57 |   }
  58 | })
  59 | 
```