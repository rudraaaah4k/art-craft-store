import { NextResponse } from 'next/server'
import { releaseExpiredReservations } from '@/lib/checkout'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (expected && authorization !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const released = await prisma.$transaction((transaction) => releaseExpiredReservations(transaction))
  return NextResponse.json({ released })
}