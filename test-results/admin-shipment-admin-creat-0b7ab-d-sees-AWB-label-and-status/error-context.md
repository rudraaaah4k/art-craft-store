# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-shipment.spec.ts >> admin creates a mock shipment and sees AWB, label, and status
- Location: tests\e2e\admin-shipment.spec.ts:5:5

# Error details

```
Test timeout of 90000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - link "Skip to main content" [ref=f4e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f4e3]:
    - generic [ref=f4e5]:
      - link "ArtCraft" [ref=f4e7] [cursor=pointer]:
        - /url: /
      - navigation "Main navigation" [ref=f4e8]:
        - link "Home" [ref=f4e9] [cursor=pointer]:
          - /url: /
        - link "Shop" [ref=f4e10] [cursor=pointer]:
          - /url: /shop
        - link "About" [ref=f4e11] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=f4e12] [cursor=pointer]:
          - /url: /contact
      - generic [ref=f4e13]:
        - generic [ref=f4e14]:
          - textbox "Search products" [ref=f4e15]:
            - /placeholder: Search...
          - button "Search" [ref=f4e16]
        - link "Shopping Cart" [ref=f4e19] [cursor=pointer]:
          - /url: /cart
          - generic "2 items in cart" [ref=f4e22]: "2"
        - button "User Account" [ref=f4e24]
  - main [ref=f4e27]:
    - generic [ref=f4e28]:
      - generic [ref=f4e30]:
        - generic [ref=f4e31]:
          - paragraph [ref=f4e32]: Art & craft studio
          - heading "Admin workspace" [level=1] [ref=f4e33]
        - generic [ref=f4e34]:
          - paragraph [ref=f4e35]: Admin User
          - link "View shop" [ref=f4e36] [cursor=pointer]:
            - /url: /
      - generic [ref=f4e37]:
        - complementary [ref=f4e38]:
          - navigation "Admin navigation" [ref=f4e39]:
            - link "Dashboard" [ref=f4e40] [cursor=pointer]:
              - /url: /admin/dashboard
            - link "Catalog" [ref=f4e41] [cursor=pointer]:
              - /url: /admin
            - link "Orders" [ref=f4e42] [cursor=pointer]:
              - /url: /admin/orders
            - link "Customers" [ref=f4e43] [cursor=pointer]:
              - /url: /admin/customers
            - link "Reports" [ref=f4e44] [cursor=pointer]:
              - /url: /admin/reports
            - link "Settings" [ref=f4e45] [cursor=pointer]:
              - /url: /admin/shipping
        - main [ref=f4e46]:
          - generic [ref=f4e47]:
            - link "Back to orders" [ref=f4e48] [cursor=pointer]:
              - /url: /admin/orders
            - generic [ref=f4e49]:
              - generic [ref=f4e50]:
                - paragraph [ref=f4e51]: Order detail
                - heading "Order cmv2mtam8000b98vbw3k1xlj9" [level=1] [ref=f4e52]
                - paragraph [ref=f4e53]: playwright-shipment-1791651109855-aapsdc@example.com · PACKED / PAID
              - link "Download invoice" [ref=f4e54] [cursor=pointer]:
                - /url: /api/admin/orders/cmv2mtam8000b98vbw3k1xlj9/invoice
            - generic [ref=f4e55]:
              - generic [ref=f4e56]:
                - heading "Customer & shipping" [level=2] [ref=f4e57]
                - paragraph [ref=f4e58]: Playwright Buyer
                - paragraph [ref=f4e59]: "9000090000"
                - paragraph [ref=f4e60]: 1 Test Street
                - paragraph [ref=f4e61]: New Delhi, Delhi 110001
              - generic [ref=f4e62]:
                - heading "Payment" [level=2] [ref=f4e63]
                - paragraph [ref=f4e64]: "Order: PAID"
                - paragraph [ref=f4e65]: "Record: CAPTURED · ₹1,000"
                - generic [ref=f4e66]:
                  - paragraph [ref=f4e67]: Shipment PACKED · AWB MOCKE4C832CBC50A
                  - link "Download mock label" [ref=f4e68] [cursor=pointer]:
                    - /url: /api/admin/orders/cmv2mtam8000b98vbw3k1xlj9/label
            - generic [ref=f4e69]:
              - heading "Items" [level=2] [ref=f4e70]
              - list [ref=f4e71]:
                - listitem [ref=f4e72]:
                  - generic [ref=f4e73]: Playwright shipment product × 1
                  - generic [ref=f4e74]: ₹1,000
              - paragraph [ref=f4e75]:
                - generic [ref=f4e76]: Total
                - generic [ref=f4e77]: ₹1,000
            - generic [ref=f4e79]:
              - generic [ref=f4e80]:
                - heading "Refund" [level=2] [ref=f4e81]
                - paragraph [ref=f4e82]: Paid ₹1,000.00 · Refundable ₹1,000.00
              - button "Issue Refund" [ref=f4e83]
  - contentinfo [ref=f4e84]:
    - generic [ref=f4e85]:
      - generic [ref=f4e86]:
        - generic [ref=f4e87]:
          - heading "ArtCraft" [level=3] [ref=f4e88]
          - paragraph [ref=f4e89]: Curated handmade art, crafts, and digital prints from skilled artisans across India. Authentic, premium, and lovingly crafted.
        - generic [ref=f4e90]:
          - heading "Shop" [level=4] [ref=f4e91]
          - list [ref=f4e92]:
            - listitem [ref=f4e93]:
              - link "All Products" [ref=f4e94] [cursor=pointer]:
                - /url: /shop
            - listitem [ref=f4e95]:
              - link "Paintings" [ref=f4e96] [cursor=pointer]:
                - /url: /shop?category=paintings
            - listitem [ref=f4e97]:
              - link "Handicrafts" [ref=f4e98] [cursor=pointer]:
                - /url: /shop?category=handicrafts
            - listitem [ref=f4e99]:
              - link "Digital Art" [ref=f4e100] [cursor=pointer]:
                - /url: /shop?category=digital-art
        - generic [ref=f4e101]:
          - heading "Help" [level=4] [ref=f4e102]
          - list [ref=f4e103]:
            - listitem [ref=f4e104]:
              - link "Contact Us" [ref=f4e105] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=f4e106]:
              - link "Shipping Policy" [ref=f4e107] [cursor=pointer]:
                - /url: /shipping-policy
            - listitem [ref=f4e108]:
              - link "Return & Refund" [ref=f4e109] [cursor=pointer]:
                - /url: /return-policy
            - listitem [ref=f4e110]:
              - link "About Us" [ref=f4e111] [cursor=pointer]:
                - /url: /about
        - generic [ref=f4e112]:
          - heading "Legal" [level=4] [ref=f4e113]
          - list [ref=f4e114]:
            - listitem [ref=f4e115]:
              - link "Privacy Policy" [ref=f4e116] [cursor=pointer]:
                - /url: /privacy-policy
            - listitem [ref=f4e117]:
              - link "Terms of Service" [ref=f4e118] [cursor=pointer]:
                - /url: /terms
      - paragraph [ref=f4e120]: © 2026 ArtCraft Store. All rights reserved.
  - button "Open Next.js Dev Tools" [ref=f4e126] [cursor=pointer]
  - alert [ref=f4e130]
```