import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pincode = searchParams.get('pincode')
  const weight = parseInt(searchParams.get('weight') || '500')

  // Mock implementation for Phase 3
  // In Phase 5, this will call the real Shiprocket API
  
  if (!pincode || pincode.length !== 6) {
    return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 })
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Fake logic for mock
  if (pincode.startsWith('99')) {
    return NextResponse.json({ available: false })
  }

  // Heavier items take longer in the mock
  const etdDays = weight > 2000 ? 5 : 3

  return NextResponse.json({
    available: true,
    etdDays,
    codAvailable: !pincode.startsWith('88'),
  })
}
