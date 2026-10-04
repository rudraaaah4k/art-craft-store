# ArtCraft Store Admin Guide

This guide is for the store owner. You can manage the shop from `/admin` without editing code.

## 1. Log In

1. Open `/auth/login`.
2. Enter your admin email and password.
3. Select **Login with Email**.
4. Open **Admin workspace** from the account menu.

[SCREENSHOT: admin login form]

## 2. Manage Products

### Add a product

1. Open **Catalog**.
2. Stay on the **Products** tab.
3. Fill in the product title, slug, SKU, category, description, price, stock, weight, and dimensions.
4. Upload an image, or paste an image URL. Add helpful alt text.
5. Select **+ Add variant** when the product has choices such as size or color. Enter the variant price, SKU, and stock.
6. Choose **Draft** while preparing the listing, or **Published** when it is ready for customers.
7. Select **Create product**.

[SCREENSHOT: new product form with image and variant]

### Edit or publish a product

1. Find the product in the Products list.
2. Select **Edit**.
3. Change the fields you need, including images, variants, stock, price, or status.
4. Choose **Published** to show it in the shop, or **Draft** to hide it.
5. Select **Update product**.

Use **Duplicate** to create a draft copy. Delete only when you are sure; products with orders are kept as drafts instead of being permanently removed.

[SCREENSHOT: product list with Edit and status controls]

## 3. Categories and Coupons

### Categories

1. Open **Catalog** and select **Categories**.
2. Choose **New category**.
3. Enter a name, URL slug, and optional description.
4. Select **Save category**.
5. Use **Edit** beside a category to change it later.

### Coupons

1. Open **Catalog** and select **Coupons**.
2. Enter a unique coupon code.
3. Choose **Percent** or **Flat** and enter the discount.
4. Add an optional minimum order, usage limit, and expiry date.
5. Select **Save coupon**.

[SCREENSHOT: categories and coupons tabs]

## 4. Manage Orders

1. Open **Orders**.
2. Select **View order** to see the customer, payment, items, invoice, shipment, and refund area.
3. Use the order list to review payment and fulfillment status.
4. Download the invoice when you need a copy for the customer.

[SCREENSHOT: order list with payment and fulfillment status]

## 5. Create a Shipment

Before creating the first shipment, enter the pickup address in **Settings > Pickup address** and save it.

1. Open **Orders** and find a paid order.
2. Select **Create Shipment**.
3. Choose a mock courier and review the rate, delivery estimate, and package weight.
4. Select **Create mock shipment & schedule pickup**.
5. The order will show the AWB, courier, shipment status, and a **Download mock label** link.
6. Use the scan button to simulate the next tracking stage when testing the workflow.

The current provider is a mock Shiprocket-compatible provider. It does not book a real courier pickup.

[SCREENSHOT: courier choices and mock shipment confirmation]

## 6. Process a Refund

1. Open the paid order.
2. Select **Issue Refund**.
3. Enter the amount in rupees. Leave it blank for the full remaining refund.
4. Choose a reason and optionally add notes.
5. Select **Confirm refund**.
6. Confirm that the payment status changes to **PARTIALLY_REFUNDED** or **REFUNDED**.

The system blocks any amount greater than the remaining refundable balance. Check the refund history on the order before issuing another refund.

[SCREENSHOT: refund form and refund history]

## 7. Dashboard and Reports

1. Open **Dashboard** to see today’s orders, revenue, total revenue, recent orders, and low-stock alerts.
2. Open **Reports**.
3. Choose optional dates and a daily or monthly grouping.
4. Select **Generate Report**.
5. Select **Export CSV** when you need a spreadsheet.
6. Open **Customers** to review customers and export the customer list.

[SCREENSHOT: dashboard revenue and low-stock cards]

## 8. Edit Site Settings

1. Open **Settings > Store Settings**.
2. Update the store name, email, phone, GSTIN, GST percentage, free-shipping threshold, COD rules, return window, and low-stock threshold.
3. Enter money limits in paise where the field says **paise**. For example, Rs 999 is `99900` paise.
4. Select **Save store settings**.
5. Open **Settings > Pickup address** to update the address used for shipments.

[SCREENSHOT: store settings form]

## Important Checks Before Publishing

- Confirm the image, alt text, price, stock, dimensions, and processing time.
- Confirm the product status is **Published**.
- For variants, check every variant price, SKU, and stock value.
- For shipments, confirm the pickup address and product dimensions.
- For refunds, check the remaining refundable amount before confirming.
