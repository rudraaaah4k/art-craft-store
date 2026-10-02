import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
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
  const bom = '\uFEFF'
  const header = columns.map(escapeCsvField).join(',')
  const body = rows.map((row) => columns.map((col) => escapeCsvField(row[col])).join(',')).join('\r\n')
  return `${bom}${header}\r\n${body}`
}

export async function GET(request: Request) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 50,
    format: searchParams.get('format') ?? 'json',
  })
  if (!parsed.success) return NextResponse.json({ message: 'Invalid query params.' }, { status: 400 })

  const { page, limit, format } = parsed.data

  // Aggregate per user: only users who have placed at least one order
  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where: { orders: { some: {} } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          where: { paymentStatus: 'PAID' },
          select: { totalPaise: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where: { orders: { some: {} } } }),
  ])

  const rows = customers.map((customer) => ({
    id: customer.id,
    name: customer.name ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    totalOrders: customer._count.orders,
    paidOrders: customer.orders.length,
    totalSpentPaise: customer.orders.reduce((sum, o) => sum + o.totalPaise, 0),
    totalSpentRupees: (customer.orders.reduce((sum, o) => sum + o.totalPaise, 0) / 100).toFixed(2),
    memberSince: customer.createdAt.toISOString().slice(0, 10),
  }))

  if (format === 'csv') {
    const columns = ['name', 'email', 'phone', 'totalOrders', 'paidOrders', 'totalSpentRupees', 'memberSince']
    const csv = toCsv(rows as unknown as Record<string, unknown>[], columns)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="customers.csv"',
      },
    })
  }

  return NextResponse.json({ customers: rows, total, page, limit, pages: Math.ceil(total / limit) })
}
