import { z } from 'zod'

const nonNegativeInt = z.number().int().min(0)

export const variantInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(120),
  pricePaise: nonNegativeInt,
  sku: z.string().trim().max(80).optional().nullable(),
  stock: nonNegativeInt,
})

export const productInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens'),
  description: z.string().trim().min(1, 'Description is required'),
  categoryId: z.string().cuid('Choose a category'),
  sku: z.string().trim().min(1, 'SKU is required').max(80),
  pricePaise: z.number().int().positive('Price must be greater than zero'),
  salePricePaise: nonNegativeInt.nullable(),
  gstPercent: z.number().int().min(0).max(100),
  stock: nonNegativeInt,
  weightGrams: z.number().int().positive('Weight is required'),
  lengthCm: nonNegativeInt.nullable(),
  widthCm: nonNegativeInt.nullable(),
  heightCm: nonNegativeInt.nullable(),
  processingDays: z.number().int().min(0),
  isMadeToOrder: z.boolean(),
  codAllowed: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  metaTitle: z.string().trim().max(160).nullable(),
  metaDescription: z.string().trim().max(320).nullable(),
  images: z.array(z.object({ url: z.string().trim().min(1), altText: z.string().trim().max(160).nullable() })).min(1, 'Add at least one image'),
  variants: z.array(variantInputSchema),
}).superRefine((data, context) => {
  if (data.salePricePaise !== null && data.salePricePaise > data.pricePaise) {
    context.addIssue({ code: 'custom', path: ['salePricePaise'], message: 'Sale price cannot exceed price' })
  }
})

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens'),
  description: z.string().trim().max(500).nullable(),
})

export const couponInputSchema = z.object({
  code: z.string().trim().min(2).max(32).transform((value) => value.toUpperCase()),
  type: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.number().int().positive(),
  minOrderPaise: nonNegativeInt.nullable(),
  maxUses: nonNegativeInt.nullable(),
  validUntil: z.string().datetime().nullable(),
}).superRefine((data, context) => {
  if (data.type === 'PERCENT' && data.discountValue > 100) {
    context.addIssue({ code: 'custom', path: ['discountValue'], message: 'Percent discount cannot exceed 100' })
  }
})
