import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // All queries in parallel for speed
  const [
    ordersToday,
    ordersThisMonth,
    revenueToday,
    revenueThisMonth,
    totalRevenue,
    totalOrders,
    recentOrders,
    lowStockProducts,
    lowStockVariants,
  ] = await Promise.all([
    // Orders today (confirmed/paid)
    prisma.order.count({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfToday } } }),
    // Orders this month
    prisma.order.count({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } } }),
    // Revenue today (paise)
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfToday } }, _sum: { totalPaise: true } }),
    // Revenue this month (paise)
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } }, _sum: { totalPaise: true } }),
    // All-time revenue
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalPaise: true } }),
    // Total orders ever
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    // Recent 10 orders
    prisma.order.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        status: true,
        paymentStatus: true,
        totalPaise: true,
        shippingFullName: true,
        createdAt: true,
      },
    }),
    // Low stock products (threshold: 5 or fewer)
    prisma.product.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, variants: { none: {} }, stock: { lte: 5 } },
      select: { id: true, title: true, sku: true, stock: true },
      orderBy: { stock: 'asc' },
      take: 20,
    }),
    // Low stock variants
    prisma.variant.findMany({
      where: { stock: { lte: 5 }, product: { status: 'PUBLISHED', deletedAt: null } },
      select: { id: true, name: true, value: true, stock: true, product: { select: { id: true, title: true } } },
      orderBy: { stock: 'asc' },
      take: 20,
    }),
  ])

  return NextResponse.json({
    ordersToday,
    ordersThisMonth,
    revenueTodayPaise: revenueToday._sum.totalPaise ?? 0,
    revenueThisMonthPaise: revenueThisMonth._sum.totalPaise ?? 0,
    totalRevenuePaise: totalRevenue._sum.totalPaise ?? 0,
    totalOrders,
    recentOrders,
    lowStock: [
      ...lowStockProducts.map((p) => ({ type: 'product', id: p.id, name: p.title, sku: p.sku, stock: p.stock })),
      ...lowStockVariants.map((v) => ({ type: 'variant', id: v.id, name: `${v.product.title} — ${v.name}: ${v.value}`, sku: null, stock: v.stock })),
    ].sort((a, b) => a.stock - b.stock),
  })
}
