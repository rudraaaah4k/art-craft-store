# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-checkout.spec.ts >> guest checkout with Razorpay TEST >> adds a product, completes card payment, and records a paid order
- Location: tests\e2e\guest-checkout.spec.ts:5:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Place order' })

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - link "Skip to main content" [ref=f1e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f1e3]:
    - generic [ref=f1e5]:
      - link "ArtCraft" [ref=f1e7] [cursor=pointer]:
        - /url: /
      - navigation "Main navigation" [ref=f1e8]:
        - link "Home" [ref=f1e9] [cursor=pointer]:
          - /url: /
        - link "Shop" [ref=f1e10] [cursor=pointer]:
          - /url: /shop
        - link "About" [ref=f1e11] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=f1e12] [cursor=pointer]:
          - /url: /contact
      - generic [ref=f1e13]:
        - generic [ref=f1e14]:
          - textbox "Search products" [ref=f1e15]:
            - /placeholder: Search...
          - button "Search" [ref=f1e16]
        - link "Shopping Cart" [ref=f1e19] [cursor=pointer]:
          - /url: /cart
          - generic "1 items in cart" [ref=f1e22]: "1"
        - link "Log In" [ref=f1e23] [cursor=pointer]:
          - /url: /auth/login
  - main [ref=f1e24]:
    - generic [ref=f1e25]:
      - heading "Checkout" [level=1] [ref=f1e26]
      - generic [ref=f1e27]:
        - generic [ref=f1e28]:
          - generic [ref=f1e29]:
            - generic [ref=f1e30]:
              - text: Email
              - textbox "Email" [ref=f1e31]: playwright-guest@example.com
            - generic [ref=f1e32]:
              - text: Full name
              - textbox "Full name" [ref=f1e33]: Playwright Guest
            - generic [ref=f1e34]:
              - text: Phone
              - textbox "Phone" [ref=f1e35]: "9000090000"
            - generic [ref=f1e36]:
              - text: Pincode
              - textbox "Pincode" [ref=f1e37]: "110001"
            - generic [ref=f1e38]:
              - text: City
              - textbox "City" [ref=f1e39]: New Delhi
            - generic [ref=f1e40]:
              - text: State
              - textbox "State" [ref=f1e41]: Delhi
          - generic [ref=f1e42]:
            - text: Address line 1
            - textbox "Address line 1" [ref=f1e43]: 1 Playwright Street
          - generic [ref=f1e44]:
            - text: Address line 2
            - textbox "Address line 2" [ref=f1e45]
          - generic [ref=f1e46]:
            - text: Coupon code
            - textbox "Coupon code" [ref=f1e47]
          - group "Payment method" [ref=f1e48]:
            - generic [ref=f1e50]:
              - generic [ref=f1e51]:
                - radio "Razorpay" [checked] [ref=f1e52]
                - text: Razorpay
              - generic [ref=f1e53]:
                - radio "Cash on Delivery" [ref=f1e54]
                - text: Cash on Delivery
          - button "Processing..." [disabled] [ref=f1e55]
        - complementary [ref=f1e57]:
          - heading "Order Summary" [level=2] [ref=f1e58]
          - generic [ref=f1e59]:
            - generic [ref=f1e60]:
              - generic [ref=f1e61]: Subtotal
              - generic [ref=f1e62]: ₹5,000
            - generic [ref=f1e63]:
              - generic [ref=f1e64]: GST included
              - generic [ref=f1e65]: ₹535.71
            - generic [ref=f1e66]:
              - generic [ref=f1e67]: Shipping · Mock Surface, 5 days
              - generic [ref=f1e68]: ₹0
            - generic [ref=f1e69]:
              - generic [ref=f1e70]: Total
              - generic [ref=f1e71]: ₹5,000
            - paragraph [ref=f1e72]: Mock estimate · 1200 g total weight
          - link "Back to cart" [ref=f1e73] [cursor=pointer]:
            - /url: /cart
  - contentinfo [ref=f1e74]:
    - generic [ref=f1e75]:
      - generic [ref=f1e76]:
        - generic [ref=f1e77]:
          - heading "ArtCraft" [level=3] [ref=f1e78]
          - paragraph [ref=f1e79]: Curated handmade art, crafts, and digital prints from skilled artisans across India. Authentic, premium, and lovingly crafted.
        - generic [ref=f1e80]:
          - heading "Shop" [level=4] [ref=f1e81]
          - list [ref=f1e82]:
            - listitem [ref=f1e83]:
              - link "All Products" [ref=f1e84] [cursor=pointer]:
                - /url: /shop
            - listitem [ref=f1e85]:
              - link "Paintings" [ref=f1e86] [cursor=pointer]:
                - /url: /shop?category=paintings
            - listitem [ref=f1e87]:
              - link "Handicrafts" [ref=f1e88] [cursor=pointer]:
                - /url: /shop?category=handicrafts
            - listitem [ref=f1e89]:
              - link "Digital Art" [ref=f1e90] [cursor=pointer]:
                - /url: /shop?category=digital-art
        - generic [ref=f1e91]:
          - heading "Help" [level=4] [ref=f1e92]
          - list [ref=f1e93]:
            - listitem [ref=f1e94]:
              - link "Contact Us" [ref=f1e95] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=f1e96]:
              - link "Shipping Policy" [ref=f1e97] [cursor=pointer]:
                - /url: /shipping-policy
            - listitem [ref=f1e98]:
              - link "Return & Refund" [ref=f1e99] [cursor=pointer]:
                - /url: /return-policy
            - listitem [ref=f1e100]:
              - link "About Us" [ref=f1e101] [cursor=pointer]:
                - /url: /about
        - generic [ref=f1e102]:
          - heading "Legal" [level=4] [ref=f1e103]
          - list [ref=f1e104]:
            - listitem [ref=f1e105]:
              - link "Privacy Policy" [ref=f1e106] [cursor=pointer]:
                - /url: /privacy-policy
            - listitem [ref=f1e107]:
              - link "Terms of Service" [ref=f1e108] [cursor=pointer]:
                - /url: /terms
      - paragraph [ref=f1e110]: © 2026 ArtCraft Store. All rights reserved.
  - button "Open Next.js Dev Tools" [ref=f1e116] [cursor=pointer]
  - alert [ref=f1e120]
  - generic [ref=f1e121]:
    - generic [ref=f1e122]: Test Mode
    - iframe [active] [ref=f1e124]:
      - generic [ref=f2e3]:
        - generic [ref=f2e4]:
          - generic [ref=f2e7]:
            - generic [ref=f2e8]: A
            - generic "ArtCraft" [ref=f2e10]
          - generic [ref=f2e12]:
            - generic [ref=f2e13]:
              - generic [ref=f2e17]:
                - generic [ref=f2e18]: Price Summary
                - heading "₹ 0 1 2 3 4 5 6 7 8 9 0 , 0 1 2 3 4 5 6 7 8 9 0 0 1 2 3 4 5 6 7 8 9 0 0 1 2 3 4 5 6 7 8 9 0" [level=3] [ref=f2e22]:
                  - generic [ref=f2e23]: ₹
                  - generic [ref=f2e24]:
                    - generic [ref=f2e25]: "0"
                    - generic [ref=f2e26]: "1"
                    - generic [ref=f2e27]: "2"
                    - generic [ref=f2e28]: "3"
                    - generic [ref=f2e29]: "4"
                    - generic [ref=f2e30]: "5"
                    - generic [ref=f2e31]: "6"
                    - generic [ref=f2e32]: "7"
                    - generic [ref=f2e33]: "8"
                    - generic [ref=f2e34]: "9"
                    - generic [ref=f2e35]: "0"
                  - generic [ref=f2e36]: ","
                  - generic [ref=f2e37]:
                    - generic [ref=f2e38]: "0"
                    - generic [ref=f2e39]: "1"
                    - generic [ref=f2e40]: "2"
                    - generic [ref=f2e41]: "3"
                    - generic [ref=f2e42]: "4"
                    - generic [ref=f2e43]: "5"
                    - generic [ref=f2e44]: "6"
                    - generic [ref=f2e45]: "7"
                    - generic [ref=f2e46]: "8"
                    - generic [ref=f2e47]: "9"
                    - generic [ref=f2e48]: "0"
                  - generic [ref=f2e49]:
                    - generic [ref=f2e50]: "0"
                    - generic [ref=f2e51]: "1"
                    - generic [ref=f2e52]: "2"
                    - generic [ref=f2e53]: "3"
                    - generic [ref=f2e54]: "4"
                    - generic [ref=f2e55]: "5"
                    - generic [ref=f2e56]: "6"
                    - generic [ref=f2e57]: "7"
                    - generic [ref=f2e58]: "8"
                    - generic [ref=f2e59]: "9"
                    - generic [ref=f2e60]: "0"
                  - generic [ref=f2e61]:
                    - generic [ref=f2e62]: "0"
                    - generic [ref=f2e63]: "1"
                    - generic [ref=f2e64]: "2"
                    - generic [ref=f2e65]: "3"
                    - generic [ref=f2e66]: "4"
                    - generic [ref=f2e67]: "5"
                    - generic [ref=f2e68]: "6"
                    - generic [ref=f2e69]: "7"
                    - generic [ref=f2e70]: "8"
                    - generic [ref=f2e71]: "9"
                    - generic [ref=f2e72]: "0"
              - button "Using as +91 90000 90000" [ref=f2e73] [cursor=pointer]
            - generic [ref=f2e82]:
              - generic [ref=f2e83]: Secured by
              - generic "RazorPay" [ref=f2e84]
        - generic [ref=f2e88]:
          - generic [ref=f2e89]:
            - generic [ref=f2e90]: Payment Options
            - generic [ref=f2e91]:
              - button "Show more options" [ref=f2e92] [cursor=pointer]
              - button "Close Checkout" [ref=f2e96] [cursor=pointer]
          - separator [ref=f2e100]
          - generic [ref=f2e105]:
            - generic [ref=f2e107]:
              - generic [ref=f2e108] [cursor=pointer]:
                - radio "Cards VISA MC RUPAY MAES"
                - button "Cards VISA MC RUPAY MAES" [ref=f2e110]:
                  - generic [ref=f2e111]: Cards
                  - generic [ref=f2e115]:
                    - img "VISA" [ref=f2e117]
                    - img "MC" [ref=f2e119]
                    - img "RUPAY" [ref=f2e121]
                    - img "MAES" [ref=f2e123]
              - generic [ref=f2e124] [cursor=pointer]:
                - radio "Netbanking BARB_R CNRB PUNB_R UTBI"
                - button "Netbanking BARB_R CNRB PUNB_R UTBI" [ref=f2e126]:
                  - generic [ref=f2e127]: Netbanking
                  - generic [ref=f2e131]:
                    - img "BARB_R" [ref=f2e133]
                    - img "CNRB" [ref=f2e135]
                    - img "PUNB_R" [ref=f2e137]
                    - img "UTBI" [ref=f2e139]
              - generic [ref=f2e140] [cursor=pointer]:
                - radio "Wallet mobikwik airtelmoney olamoney"
                - button "Wallet mobikwik airtelmoney olamoney" [ref=f2e142]:
                  - generic [ref=f2e143]: Wallet
                  - generic [ref=f2e147]:
                    - img "mobikwik" [ref=f2e149]
                    - img "airtelmoney" [ref=f2e151]
                    - img "olamoney" [ref=f2e153]
            - generic [ref=f2e159]:
              - heading "Add a new card" [level=3] [ref=f2e160]
              - generic [ref=f2e161]:
                - generic [ref=f2e162]:
                  - textbox "Card Number" [ref=f2e165]
                  - generic [ref=f2e166]:
                    - textbox "MM / YY" [ref=f2e168]
                    - textbox "CVV" [ref=f2e170]
                - generic [ref=f2e172] [cursor=pointer]:
                  - checkbox "Save this card as per RBI guidelines" [ref=f2e173]
                  - generic [ref=f2e174]: Save this card as per RBI guidelines
                - button "Continue" [ref=f2e176] [cursor=pointer]
          - generic [ref=f2e179]:
            - text: By proceeding, I agree to Razorpay’s
            - button "Privacy Notice" [ref=f2e180] [cursor=pointer]
            - text: •
            - button "Edit Preferences" [ref=f2e181] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import { prisma } from '../../src/lib/prisma'
  3   | 
  4   | test.describe('guest checkout with Razorpay TEST', () => {
  5   |   test('adds a product, completes card payment, and records a paid order', async ({ page }) => {
  6   |     test.skip(
  7   |       !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET,
  8   |       'Set Razorpay TEST credentials before running the real gateway flow.',
  9   |     )
  10  | 
  11  |     const product = await prisma.product.findFirst({
  12  |       where: {
  13  |         status: 'PUBLISHED',
  14  |         deletedAt: null,
  15  |         OR: [{ stock: { gt: 0 }, variants: { none: {} } }, { variants: { some: { stock: { gt: 0 } } } }],
  16  |       },
  17  |       orderBy: { createdAt: 'asc' },
  18  |       include: { variants: { orderBy: { stock: 'desc' } } },
  19  |     })
  20  |     if (!product) throw new Error('No in-stock published product is available for checkout.')
  21  | 
  22  |     await page.goto(`/products/${product.slug}`)
  23  |     await page.getByRole('button', { name: 'Add to Cart' }).click()
  24  |     await expect(page.getByRole('status')).toContainText('Added to cart.')
  25  |     await page.goto('/checkout')
  26  | 
  27  |     await page.getByLabel('Email').fill('playwright-guest@example.com')
  28  |     await page.getByLabel('Full name').fill('Playwright Guest')
  29  |     await page.getByLabel('Phone').fill('9000090000')
  30  |     await page.getByLabel('Pincode').fill('110001')
  31  |     await page.getByLabel('City').fill('New Delhi')
  32  |     await page.getByLabel('State').fill('Delhi')
  33  |     await page.getByLabel('Address line 1').fill('1 Playwright Street')
  34  |     await page.getByRole('button', { name: 'Place order' }).click()
  35  | 
  36  |     const orderResponsePromise = page.waitForResponse(response => response.url().includes('/api/checkout/orders') && response.status() === 201)
> 37  |     await page.getByRole('button', { name: 'Place order' }).click()
      |                                                             ^ Error: locator.click: Test timeout of 90000ms exceeded.
  38  |     const orderResponse = await orderResponsePromise
  39  |     const orderData = await orderResponse.json()
  40  |     const orderId = orderData.orderId
  41  | 
  42  |     // Wait for the payment record to be created by the subsequent API call
  43  |     const paymentResponsePromise = page.waitForResponse(response => response.url().includes('/api/payments/razorpay/order') && response.status() === 200)
  44  |     await paymentResponsePromise
  45  | 
  46  |     const order = await prisma.order.findUnique({
  47  |       where: { id: orderId },
  48  |       include: { payment: true }
  49  |     })
  50  |     
  51  |     if (!order || !order.payment) throw new Error('Order or Payment not found in DB')
  52  | 
  53  |     const { createHmac } = await import('node:crypto')
  54  |     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  55  |     if (!webhookSecret) throw new Error('RAZORPAY_WEBHOOK_SECRET is missing')
  56  | 
  57  |     const externalOrderId = (order.payment.metadata as any)?.externalOrderId
  58  |     if (!externalOrderId) throw new Error('externalOrderId missing from payment metadata')
  59  | 
  60  |     const payload = {
  61  |       entity: 'event',
  62  |       account_id: 'acc_local_webhook_test',
  63  |       event: 'payment.captured',
  64  |       contains: ['payment'],
  65  |       payload: {
  66  |         payment: {
  67  |           entity: {
  68  |             id: 'pay_test_' + Date.now(),
  69  |             entity: 'payment',
  70  |             amount: order.totalPaise,
  71  |             currency: 'INR',
  72  |             status: 'captured',
  73  |             order_id: externalOrderId,
  74  |             captured: true,
  75  |           },
  76  |         },
  77  |       },
  78  |       created_at: Math.floor(Date.now() / 1000),
  79  |     }
  80  |     const rawBody = JSON.stringify(payload)
  81  |     const signature = createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  82  | 
  83  |     const webhookResponse = await page.request.post('/api/webhooks/razorpay', {
  84  |       headers: {
  85  |         'Content-Type': 'application/json',
  86  |         'X-Razorpay-Signature': signature,
  87  |         'X-Razorpay-Event-Id': 'evt_test_' + Date.now(),
  88  |       },
  89  |       data: rawBody,
  90  |     })
  91  |     expect(webhookResponse.ok()).toBeTruthy()
  92  | 
  93  |     await page.goto(`/orders/${orderId}`)
  94  |     await expect(page.getByText('Order confirmed')).toBeVisible({ timeout: 15_000 })
  95  |     
  96  |     await expect.poll(async () => {
  97  |       const updatedOrder = await prisma.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } })
  98  |       return updatedOrder?.paymentStatus
  99  |     }, { timeout: 15_000 }).toBe('PAID')
  100 |   })
  101 | })
  102 | 
```