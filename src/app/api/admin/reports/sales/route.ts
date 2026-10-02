import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'month']).default('day'),
  format: z.enum(['json', 'csv']).default('json'),
})

function escapeCsvField(val: unknown): string {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const bom = '\uFEFF' // UTF-8 BOM — ensures Excel opens correctly without mojibake
  const header = columns.map(escapeCsvField).join(',')
  const body = rows.map((row) => columns.map((col) => escapeCsvField(row[col])).join(',')).join('\r\n')
  return `${bom}${header}\r\n${body}`
}

export async function GET(request: Request) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    groupBy: searchParams.get('groupBy') ?? 'day',
    format: searchParams.get('format') ?? 'json',
  })
  if (!parsed.success) return NextResponse.json({ message: 'Invalid query params.', issues: parsed.error.flatten() }, { status: 400 })

  const { from, to, groupBy, format } = parsed.data
  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const toDate = to ? new Date(to) : new Date()

  const orders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: fromDate, lte: toDate } },
    select: { id: true, totalPaise: true, discountPaise: true, shippingPaise: true, gstPaise: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Group by day or month
  const grouped = new Map<string, { period: string; orders: number; revenuePaise: number; discountPaise: number; shippingPaise: number; gstPaise: number }>()
  for (const order of orders) {
    const d = order.createdAt
    const key = groupBy === 'day'
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = grouped.get(key) ?? { period: key, orders: 0, revenuePaise: 0, discountPaise: 0, shippingPaise: 0, gstPaise: 0 }
    entry.orders += 1
    entry.revenuePaise += order.totalPaise
    entry.discountPaise += order.discountPaise
    entry.shippingPaise += order.shippingPaise
    entry.gstPaise += order.gstPaise
    grouped.set(key, entry)
  }

  const rows = Array.from(grouped.values()).map((r) => ({
    ...r,
    revenueRupees: (r.revenuePaise / 100).toFixed(2),
    discountRupees: (r.discountPaise / 100).toFixed(2),
    shippingRupees: (r.shippingPaise / 100).toFixed(2),
    gstRupees: (r.gstPaise / 100).toFixed(2),
  }))

  if (format === 'csv') {
    const columns = ['period', 'orders', 'revenueRupees', 'discountRupees', 'shippingRupees', 'gstRupees']
    const csv = toCsv(rows as unknown as Record<string, unknown>[], columns)
    // Return explicit UTF-8 bytes so Excel sees the BOM (Response.text() strips BOM when decoding).
    const bytes = new TextEncoder().encode(csv)
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sales-report-${groupBy}.csv"`,
      },
    })
  }

  return NextResponse.json({ from: fromDate.toISOString(), to: toDate.toISOString(), groupBy, rows })
}
