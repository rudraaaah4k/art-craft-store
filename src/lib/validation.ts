import { z } from 'zod'

export const registrationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
})

export const emailPasswordSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
})

export const phoneOtpSchema = z.object({
  phone: z.string().trim().min(7).max(20),
  otp: z.string().regex(/^\d{6}$/),
})

export const cartItemSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  variantId: z.string().trim().min(1).max(100).nullable().optional(),
  quantity: z.number().int().min(1).max(20).default(1),
})

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1).max(20),
})

export const checkoutQuoteSchema = z.object({
  couponCode: z.string().trim().max(32).optional().default(''),
  postalCode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  paymentMethod: z.enum(['RAZORPAY', 'COD']).default('RAZORPAY'),
})

export const checkoutOrderSchema = checkoutQuoteSchema.extend({
  email: z.string().trim().email().max(320),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  addressId: z.string().trim().min(1).max(100).optional(),
})

export const paymentOrderSchema = z.object({ orderId: z.string().trim().min(1).max(100) })

export const paymentVerifySchema = z.object({
  orderId: z.string().trim().min(1).max(100),
  razorpayOrderId: z.string().trim().min(1).max(100),
  razorpayPaymentId: z.string().trim().min(1).max(100),
  razorpaySignature: z.string().trim().min(1).max(200),
})

export const razorpayWebhookSchema = z.object({
  event: z.string().min(1),
  payload: z.object({
    payment: z.object({
      entity: z.object({ id: z.string().optional(), order_id: z.string().optional(), amount: z.number().optional() }),
    }).optional(),
  }).optional(),
})

export const addressSchema = z.object({
  label: z.string().trim().max(50).optional().default(''),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^\d{6}$/),
  isDefault: z.boolean().default(false),
})

export const reviewSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(''),
  body: z.string().trim().max(2000).optional().default(''),
})

export const pickupAddressSchema = z.object({
  pickupName: z.string().trim().min(2).max(120),
  pickupEmail: z.string().trim().email().max(320),
  pickupPhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  pickupAddressLine1: z.string().trim().min(3).max(200),
  pickupAddressLine2: z.string().trim().max(200).optional().default(''),
  pickupCity: z.string().trim().min(2).max(100),
  pickupState: z.string().trim().min(2).max(100),
  pickupPostalCode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  pickupCountry: z.string().trim().min(2).max(80).default('India'),
})

export const shippingServiceabilitySchema = z.object({
  postalCode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  weightGrams: z.coerce.number().int().min(0).max(100000),
  amountPaise: z.coerce.number().int().min(0).max(100000000),
  lengthCm: z.coerce.number().positive().max(300).optional(),
  widthCm: z.coerce.number().positive().max(300).optional(),
  heightCm: z.coerce.number().positive().max(300).optional(),
})

export const createMockShipmentSchema = z.object({
  courierId: z.string().trim().min(1).max(120),
})