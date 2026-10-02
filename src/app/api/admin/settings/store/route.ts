import { NextResponse } from 'next/response'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdminAPI } from '@/lib/admin'

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeEmail: z.string().email('Invalid email').nullable().optional(),
  storePhone: z.string().nullable().optional(),
  logoUrl: z.string().url('Invalid logo URL').nullable().optional(),
  sellerGstin: z.string().nullable().optional(),
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
  try {
    await requireAdminAPI()
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      return NextResponse.json({ message: 'Settings not found' }, { status: 404 })
    }
    return NextResponse.json(settings)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Store settings fetch error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminAPI()
    const body = await request.json()
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
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Store settings update error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
