import { randomUUID } from 'node:crypto'
import { createHmac, timingSafeEqual } from 'node:crypto'

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
  externalOrderId: string
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentIntent>
  verifyPayment(paymentId: string, signature: string): Promise<boolean>
}

function hasRazorpayCredentials() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.startsWith('your-'))
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
      externalOrderId: `mock_order_${input.orderId}`,
    }
  }

  async verifyPayment(paymentId: string, signature: string): Promise<boolean> {
    return paymentId.length > 0 && signature.length > 0
  }
}

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly provider = 'razorpay'

  async createPayment(input: CreatePaymentInput): Promise<PaymentIntent> {
    const credentials = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: input.amountPaise, currency: input.currency, receipt: input.orderId, notes: input.metadata ?? {} }),
    })
    if (!response.ok) throw new Error('Razorpay order creation failed.')
    const order = await response.json() as { id: string; amount: number; currency: string; status: string }
    return { id: '', provider: this.provider, orderId: input.orderId, amountPaise: order.amount, currency: order.currency, status: 'PENDING', externalOrderId: order.id }
  }

  async verifyPayment(paymentId: string, signature: string): Promise<boolean> {
    const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '').update(`${paymentId}|${signature}`).digest('hex')
    return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  }
}

export function getPaymentProvider(): PaymentProvider {
  return hasRazorpayCredentials() ? new RazorpayPaymentProvider() : new MockPaymentProvider()
}

export function verifyRazorpayWebhook(rawBody: string, signature: string) {
  const expected = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '').update(rawBody).digest('hex')
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
