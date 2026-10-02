import { MockShippingProvider } from '../src/lib/providers/shipping'

async function main() {
  const provider = new MockShippingProvider()
  const input = { postalCode: '110001', weightGrams: 1200, amountPaise: 85000 }
  await provider.getRates(input)
  const initialRefreshCount = provider.authSession.refreshCount

  provider.authSession.expireToken()
  const afterExpiryRates = await provider.getRates(input)
  const refreshesAfterExpiry = provider.authSession.refreshCount

  provider.authSession.simulateUnauthorizedOnce()
  const afterUnauthorizedRates = await provider.getRates(input)
  const refreshesAfterUnauthorized = provider.authSession.refreshCount

  const passed = initialRefreshCount === 1
    && refreshesAfterExpiry === 2
    && refreshesAfterUnauthorized === 3
    && afterExpiryRates.length > 0
    && afterUnauthorizedRates.length > 0

  console.log(JSON.stringify({
    initialRefreshCount,
    refreshesAfterExpiry,
    refreshesAfterUnauthorized,
    ratesAfterExpiry: afterExpiryRates.length,
    ratesAfterUnauthorized: afterUnauthorizedRates.length,
    passed,
  }, null, 2))

  if (!passed) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})