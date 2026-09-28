import { randomUUID } from 'node:crypto'

export interface ShippingRateInput {
  postalCode: string
  weightGrams: number
  amountPaise: number
}

export interface ShippingRate {
  id: string
  provider: string
  amountPaise: number
  estimatedDays: number
}

export interface CreateShipmentInput {
  orderId: string
  postalCode: string
  weightGrams: number
  items: Array<{ title: string; quantity: number }>
}

export interface ShipmentResult {
  id: string
  provider: string
  status: 'PENDING'
}

export interface ShippingProvider {
  getRates(input: ShippingRateInput): Promise<ShippingRate[]>
  createShipment(input: CreateShipmentInput): Promise<ShipmentResult>
  trackShipment(trackingNumber: string): Promise<{ status: string }>
}

export class MockShippingProvider implements ShippingProvider {
  constructor(public readonly provider = 'mock') {}

  async getRates(input: ShippingRateInput): Promise<ShippingRate[]> {
    return [{
      id: `${this.provider}_rate_${randomUUID()}`,
      provider: this.provider,
      amountPaise: input.amountPaise >= 99900 ? 0 : 9900,
      estimatedDays: 5,
    }]
  }

  async createShipment(input: CreateShipmentInput): Promise<ShipmentResult> {
    return { id: `${this.provider}_shipment_${input.orderId}`, provider: this.provider, status: 'PENDING' }
  }

  async trackShipment(trackingNumber: string): Promise<{ status: string }> {
    return { status: trackingNumber ? 'IN_TRANSIT' : 'PENDING' }
  }
}

export function getShippingProvider(): ShippingProvider {
  const configured = Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)
  return new MockShippingProvider(configured ? 'shiprocket-mock' : 'mock')
}
