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