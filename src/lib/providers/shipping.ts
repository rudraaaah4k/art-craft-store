import { randomUUID } from 'node:crypto'

export interface ShippingRateInput {
  postalCode: string
  weightGrams: number
  amountPaise: number
  dimensionsCm?: PackageDimensions
}

export interface PackageDimensions {
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface ShippingRate {
  id: string
  provider: string
  courierName: string
  amountPaise: number
  estimatedDays: number
  chargeableWeightGrams: number
}

export interface ShippingServiceability {
  available: boolean
  codAvailable: boolean
  estimatedDays: number | null
  rates: ShippingRate[]
}

export interface CreateShipmentInput {
  orderId: string
  postalCode: string
  weightGrams: number
  dimensionsCm: PackageDimensions
  courier: ShippingRate
  pickupAddress: {
    name: string
    email: string
    phone: string
    line1: string
    line2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
  deliveryAddress: {
    name: string
    phone: string
    line1: string
    line2: string | null
    city: string
    state: string
    postalCode: string
  }
  items: Array<{ title: string; sku: string | null; quantity: number; unitPricePaise: number }>
}

export interface ShipmentResult {
  id: string
  provider: string
  status: 'PACKED'
  trackingNumber: string
  courierName: string
  trackingUrl: string
  labelUrl: string
  pickupScheduledAt: string
}

export interface ShippingProvider {
  getRates(input: ShippingRateInput): Promise<ShippingRate[]>
  checkServiceability(input: ShippingRateInput): Promise<ShippingServiceability>
  createShipment(input: CreateShipmentInput): Promise<ShipmentResult>
  trackShipment(trackingNumber: string): Promise<{ status: string }>
}

class MockAuthTokenExpiredError extends Error {}

export class MockShiprocketAuthSession {
  private token = ''
  private expiresAt = 0
  private refreshes = 0
  private unauthorizedOnce = false

  get refreshCount() {
    return this.refreshes
  }

  expireToken() {
    this.expiresAt = 0
  }

  simulateUnauthorizedOnce() {
    this.unauthorizedOnce = true
  }

  async execute<T>(operation: (token: string) => Promise<T>): Promise<T> {
    let token = this.getValidToken()
    try {
      if (this.unauthorizedOnce) {
        this.unauthorizedOnce = false
        throw new MockAuthTokenExpiredError('Mock Shiprocket token expired.')
      }
      return await operation(token)
    } catch (error) {
      if (!(error instanceof MockAuthTokenExpiredError)) throw error
      token = this.refreshToken()
      return operation(token)
    }
  }

  private getValidToken() {
    if (!this.token || Date.now() >= this.expiresAt) return this.refreshToken()
    return this.token
  }

  private refreshToken() {
    this.refreshes += 1
    this.token = `mock-shiprocket-token-${this.refreshes}`
    this.expiresAt = Date.now() + 240 * 60 * 60 * 1000
    return this.token
  }
}

export class MockShippingProvider implements ShippingProvider {
  readonly provider = 'mock'
  readonly authSession = new MockShiprocketAuthSession()

  async getRates(input: ShippingRateInput): Promise<ShippingRate[]> {
    return this.authSession.execute(async () => {
      if (!/^\d{6}$/.test(input.postalCode)) throw new Error('Enter a valid 6-digit delivery pincode.')
      if (input.postalCode.startsWith('99')) return []

      const volumetricWeightGrams = input.dimensionsCm
        ? Math.ceil(input.dimensionsCm.lengthCm * input.dimensionsCm.widthCm * input.dimensionsCm.heightCm / 5000 * 1000)
        : 0
      const chargeableWeightGrams = Math.max(input.weightGrams, volumetricWeightGrams, 500)
      const baseRate = 4900 + Math.ceil(chargeableWeightGrams / 500) * 2500

      return [
        { id: `${this.provider}_surface_${input.postalCode}`, provider: this.provider, courierName: 'Mock Surface', amountPaise: baseRate, estimatedDays: 5, chargeableWeightGrams },
        { id: `${this.provider}_priority_${input.postalCode}`, provider: this.provider, courierName: 'Mock Priority', amountPaise: baseRate + 4000, estimatedDays: 3, chargeableWeightGrams },
      ]
    })
  }

  async checkServiceability(input: ShippingRateInput): Promise<ShippingServiceability> {
    const rates = await this.getRates(input)
    return {
      available: rates.length > 0,
      codAvailable: !input.postalCode.startsWith('88') && rates.length > 0,
      estimatedDays: rates.length ? Math.min(...rates.map((rate) => rate.estimatedDays)) : null,
      rates,
    }
  }

  async createShipment(input: CreateShipmentInput): Promise<ShipmentResult> {
    return this.authSession.execute(async () => {
      const trackingNumber = `MOCK${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
      return {
        id: `${this.provider}_shipment_${input.orderId}`,
        provider: this.provider,
        status: 'PACKED',
        trackingNumber,
        courierName: input.courier.courierName,
        trackingUrl: `/tracking/${trackingNumber}`,
        labelUrl: `/api/admin/orders/${input.orderId}/label`,
        pickupScheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    })
  }

  async trackShipment(trackingNumber: string): Promise<{ status: string }> {
    return this.authSession.execute(async () => ({ status: trackingNumber ? 'IN_TRANSIT' : 'PENDING' }))
  }
}

const mockShippingProvider = new MockShippingProvider()

export function getShippingProvider(): ShippingProvider {
  return mockShippingProvider
}

// Real Shiprocket transport is intentionally disabled for mock-only Phase 5.
export const realShiprocketStubs = {
  async login(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async refreshToken(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async getServiceability(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async getRates(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async createOrder(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async assignAwb(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async createShipment(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async trackShipment(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async generateLabel(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async schedulePickup(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
  async syncTracking(): Promise<never> {
    throw new Error('Real Shiprocket API is disabled; mock shipping is active.')
  },
}
