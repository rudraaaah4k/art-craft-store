import { randomUUID } from 'node:crypto'

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'FAILED'

export interface CreatePaymentInput {
  orderId: string
  amountPaise: number
  currency: string
  metadata?: Record<string, unknown>
}

export interface PaymentIntent {
  id: string
  provider: string
  orderId: string
  amountPaise: number
  currency: string
  status: PaymentStatus
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentIntent>
  verifyPayment(paymentId: string, signature: string): Promise<boolean>
}

export class MockPaymentProvider implements PaymentProvider {
  constructor(public readonly provider = 'mock') {}

  async createPayment(input: CreatePaymentInput): Promise<PaymentIntent> {
    return {
      id: `${this.provider}_${randomUUID()}`,
      provider: this.provider,
      orderId: input.orderId,
      amountPaise: input.amountPaise,
      currency: input.currency,
      status: 'AUTHORIZED',
    }
  }

  async verifyPayment(paymentId: string, signature: string): Promise<boolean> {
    return paymentId.length > 0 && signature.length > 0
  }
}

export function getPaymentProvider(): PaymentProvider {
  const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  return new MockPaymentProvider(configured ? 'razorpay-mock' : 'mock')
}
