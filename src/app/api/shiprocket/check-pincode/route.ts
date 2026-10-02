import { NextResponse } from 'next/server'
import { getShippingProvider } from '@/lib/providers/shipping'
import { shippingServiceabilitySchema } from '@/lib/validation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = shippingServiceabilitySchema.safeParse({
    postalCode: searchParams.get('pincode'),
    weightGrams: searchParams.get('weight'),
    amountPaise: searchParams.get('amount') ?? '0',
    lengthCm: searchParams.get('length') ?? undefined,
    widthCm: searchParams.get('width') ?? undefined,
    heightCm: searchParams.get('height') ?? undefined,
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid serviceability request.' }, { status: 400 })

  try {
    const { postalCode, weightGrams, amountPaise, lengthCm, widthCm, heightCm } = parsed.data
    const result = await getShippingProvider().checkServiceability({
      postalCode,
      weightGrams,
      amountPaise,
      dimensionsCm: lengthCm && widthCm && heightCm ? { lengthCm, widthCm, heightCm } : undefined,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Delivery check is temporarily unavailable. Please retry.' }, { status: 503 })
  }
}
