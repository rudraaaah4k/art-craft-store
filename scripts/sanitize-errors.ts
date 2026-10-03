import fs from 'fs'
import path from 'path'

const filesToFix = [
  "src/app/api/payments/razorpay/order/route.ts",
  "src/app/api/checkout/quote/route.ts",
  "src/app/api/checkout/orders/route.ts",
  "src/app/api/admin/products/[id]/route.ts",
  "src/app/api/admin/products/route.ts",
  "src/app/api/admin/orders/[id]/shipment/route.ts",
  "src/app/api/admin/orders/[id]/couriers/route.ts"
]

for (const relativePath of filesToFix) {
  const absolutePath = path.join(process.cwd(), relativePath)
  let content = fs.readFileSync(absolutePath, 'utf8')
  
  // Replace `error instanceof Error ? error.message : '...'` with just `'...'`
  content = content.replace(/error instanceof Error \? error\.message : ('[^']+')/g, "$1")
  
  // Some files might have `detail: error instanceof Error ? error.message : 'Unknown error'`
  content = content.replace(/, detail: error instanceof Error \? error\.message : 'Unknown error'/g, "")

  fs.writeFileSync(absolutePath, content)
  console.log(`Sanitized ${relativePath}`)
}
