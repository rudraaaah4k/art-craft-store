const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000'

const checks = [
  ['home page', '/', 200, 'Discover Authentic Indian Craftsmanship'],
  ['shop page', '/shop', 200, 'Shop'],
  ['about page', '/about', 200, 'About'],
  ['contact page', '/contact', 200, 'Contact'],
  ['products API', '/api/products', 200, '['],
  ['robots', '/robots.txt', 200, 'Sitemap'],
  ['sitemap', '/sitemap.xml', 200, '<urlset'],
  ['invalid pincode', '/api/shiprocket/check-pincode?pincode=123', 400, 'valid 6-digit pincode'],
]

let failures = 0

for (const [name, path, expectedStatus, expectedText] of checks) {
  const response = await fetch(new URL(path, baseUrl))
  const body = await response.text()
  const statusOk = response.status === expectedStatus
  const bodyOk = body.toLowerCase().includes(expectedText.toLowerCase())

  if (!statusOk || !bodyOk) {
    failures += 1
    console.error(`FAIL ${name}: status ${response.status}, expected ${expectedStatus}; body contains "${expectedText}": ${bodyOk}`)
    continue
  }

  console.log(`PASS ${name}`)
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed.`)
  process.exitCode = 1
} else {
  console.log(`\n${checks.length} end-to-end smoke checks passed.`)
}
