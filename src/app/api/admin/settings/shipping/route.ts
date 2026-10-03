import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { pickupAddressSchema } from '@/lib/validation'

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const settings = await prisma.settings.findUnique({ where: { key: 'default' } })
  return NextResponse.json({
    pickupName: settings?.pickupName ?? '',
    pickupEmail: settings?.pickupEmail ?? '',
    pickupPhone: settings?.pickupPhone ?? '',
    pickupAddressLine1: settings?.pickupAddressLine1 ?? '',
    pickupAddressLine2: settings?.pickupAddressLine2 ?? '',
    pickupCity: settings?.pickupCity ?? '',
    pickupState: settings?.pickupState ?? '',
    pickupPostalCode: settings?.pickupPostalCode ?? '',
    pickupCountry: settings?.pickupCountry ?? 'India',
  })
}

export async function PUT(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const parsed = pickupAddressSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })

  const settings = await prisma.settings.upsert({
    where: { key: 'default' },
    create: { key: 'default', ...parsed.data, pickupAddressLine2: parsed.data.pickupAddressLine2 || null },
    update: { ...parsed.data, pickupAddressLine2: parsed.data.pickupAddressLine2 || null },
  })
  return NextResponse.json({
    pickupName: settings.pickupName,
    pickupEmail: settings.pickupEmail,
    pickupPhone: settings.pickupPhone,
    pickupAddressLine1: settings.pickupAddressLine1,
    pickupAddressLine2: settings.pickupAddressLine2,
    pickupCity: settings.pickupCity,
    pickupState: settings.pickupState,
    pickupPostalCode: settings.pickupPostalCode,
    pickupCountry: settings.pickupCountry,
  })
}