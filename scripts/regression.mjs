// Comprehensive regression test for all CSRF-protected routes

console.log('=== REGRESSION TEST: CSRF-Protected Routes ===\n')

async function runTest() {
  // 1. Cart (NO CSRF check - should just work)
  console.log('--- Cart POST (no CSRF check on this route) ---')
  const cartRes = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ productId: 'cmulfd67v001528vbkyqt6q8f', quantity: 1 }),
  })
  console.log('Status:', cartRes.status, '- Body:', await cartRes.text())

  // 2. Wishlist POST (HAS CSRF check)
  console.log('\n--- Wishlist POST (has CSRF, no auth -> expect 401 not 403) ---')
  const wlRes = await fetch('http://localhost:3000/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ productId: 'cmulfd67v001528vbkyqt6q8f' }),
  })
  console.log('Status:', wlRes.status, '- Body:', await wlRes.text())

  // 3. Checkout POST (HAS CSRF check)
  console.log('\n--- Checkout POST (has CSRF, same origin, no cart -> expect 400) ---')
  const coRes = await fetch('http://localhost:3000/api/checkout/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'test@test.com' }),
  })
  console.log('Status:', coRes.status, '- Body:', await coRes.text())

  // 4. Reviews POST (HAS CSRF check)
  console.log('\n--- Reviews POST (has CSRF, same origin, no auth -> expect 401) ---')
  const rvRes = await fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ productId: 'test', rating: 5 }),
  })
  console.log('Status:', rvRes.status, '- Body:', await rvRes.text())

  // 5. Address POST (HAS CSRF check)
  console.log('\n--- Address POST (has CSRF, same origin, no auth -> expect 401) ---')
  const adRes = await fetch('http://localhost:3000/api/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({}),
  })
  console.log('Status:', adRes.status, '- Body:', await adRes.text())

  console.log('\n=== DONE ===')
}

runTest()
