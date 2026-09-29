import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pincode = searchParams.get('pincode')
  const _weight = searchParams.get('weight')

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

  return NextResponse.json({
    available: true,
    etdDays: 3,
    codAvailable: !pincode.startsWith('88'),
  })
}
