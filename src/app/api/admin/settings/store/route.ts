import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminApiSession } from '@/lib/admin'

const emptyToNull = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? null : value)

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeEmail: z.preprocess(emptyToNull, z.string().email('Invalid email').nullable().optional()),
  storePhone: z.preprocess(emptyToNull, z.string().nullable().optional()),
  logoUrl: z.preprocess(emptyToNull, z.string().url('Invalid logo URL').nullable().optional()),
  sellerGstin: z.preprocess(emptyToNull, z.string().nullable().optional()),
  currency: z.string().default('INR'),
  gstPercent: z.number().min(0).max(100),
  freeShippingThreshold: z.number().min(0),
  codEnabled: z.boolean(),
  codMaxPaise: z.number().min(0),
  codFeePaise: z.number().min(0),
  returnWindowDays: z.number().min(0),
  lowStockThreshold: z.number().min(0),
})

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const settings = await prisma.settings.findFirst()
  if (!settings) {
    return NextResponse.json({ message: 'Settings not found' }, { status: 404 })
  }
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = storeSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid data', issues: parsed.error.flatten() }, { status: 400 })
  }

  const current = await prisma.settings.findFirst()
  if (!current) {
    return NextResponse.json({ message: 'Settings not initialized' }, { status: 404 })
  }

  const updated = await prisma.settings.update({
    where: { id: current.id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}
