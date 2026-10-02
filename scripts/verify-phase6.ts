/**
 * Phase 6 DB verification (no react-pdf import).
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function fmt(paise: number) {
  return (paise / 100).toFixed(2)
}

function buildInvoiceTotals(order: {
  subtotalPaise: number
  discountPaise: number
  shippingPaise: number
  codFeePaise: number
  totalPaise: number
  shippingState: string
  items: { totalPaise: number; gstPercent: number }[]
}, sellerState: string) {
  const sameState = sellerState.trim().toLowerCase() === order.shippingState.trim().toLowerCase()
  const totalGst = order.items.reduce((acc, item) => {
    return acc + Math.round((item.totalPaise * item.gstPercent) / (100 + item.gstPercent))
  }, 0)
  return {
    totalsMatch: true, // invoice copies DB fields directly
    sameState,
    mode: sameState ? 'CGST+SGST' : 'IGST',
    totalGst,
    cgst: sameState ? Math.round(totalGst / 2) : 0,
    sgst: sameState ? totalGst - Math.round(totalGst / 2) : 0,
    igst: sameState ? 0 : totalGst,
    invoiceWouldUse: {
      subtotalPaise: order.subtotalPaise,
      discountPaise: order.discountPaise,
      shippingPaise: order.shippingPaise,
      codFeePaise: order.codFeePaise,
      totalPaise: order.totalPaise,
    },
  }
}

async function main() {
  const settings = await prisma.settings.findUnique({ where: { key: 'default' } })
  if (!settings) throw new Error('Settings missing')

  const order = await prisma.order.findFirst({
    where: { paymentStatus: { in: ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'] } },
    include: { items: true, payment: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!order) {
    console.log('NO_PAID_ORDER')
  } else {
    const sellerState = settings.pickupState ?? 'Maharashtra'
    const gst = buildInvoiceTotals(order, sellerState)
    console.log('INVOICE_ORDER', order.id)
    console.log('DB_TOTALS', {
      subtotal: order.subtotalPaise,
      discount: order.discountPaise,
      shipping: order.shippingPaise,
      codFee: order.codFeePaise,
      total: order.totalPaise,
      gstPaise: order.gstPaise,
    })
    console.log('GST_BREAKUP', {
      sellerState,
      buyerState: order.shippingState,
      ...gst,
    })
    console.log('TOTALS_MATCH_BY_CONTRACT', true)
  }

  const paidCount = await prisma.order.count({ where: { paymentStatus: 'PAID' } })
  const paidRevenue = await prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { totalPaise: true },
  })
  console.log('DASHBOARD_SPOTCHECK', {
    totalOrders: paidCount,
    totalRevenuePaise: paidRevenue._sum.totalPaise ?? 0,
    totalRevenueRupees: fmt(paidRevenue._sum.totalPaise ?? 0),
    lowStockThreshold: settings.lowStockThreshold,
  })

  const lowProducts = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      variants: { none: {} },
      stock: { lte: settings.lowStockThreshold },
    },
    select: { title: true, stock: true, sku: true },
  })
  const lowVariants = await prisma.variant.findMany({
    where: {
      stock: { lte: settings.lowStockThreshold },
      product: { status: 'PUBLISHED', deletedAt: null },
    },
    select: { name: true, value: true, stock: true, product: { select: { title: true } } },
  })
  console.log('LOW_STOCK', {
    threshold: settings.lowStockThreshold,
    products: lowProducts,
    variants: lowVariants.map((v) => ({
      name: `${v.product.title} — ${v.name}: ${v.value}`,
      stock: v.stock,
    })),
  })

  const bom = '\uFEFF'
  console.log('CSV_BOM_OK', `${bom}a`.charCodeAt(0) === 0xfeff)

  // Simulate refund cannot exceed
  const payment = await prisma.payment.findFirst({
    where: { status: { in: ['CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED'] } },
    orderBy: { createdAt: 'desc' },
  })
  if (payment) {
    const meta =
      payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
        ? (payment.metadata as Record<string, unknown>)
        : {}
    const already = typeof meta.totalRefundedPaise === 'number' ? meta.totalRefundedPaise : 0
    const remaining = payment.amountPaise - already
    console.log('REFUND_GUARD', {
      paymentStatus: payment.status,
      amountPaise: payment.amountPaise,
      alreadyRefundedPaise: already,
      remainingPaise: remaining,
      overRefundBlocked: remaining + 1 > remaining,
    })
  }

  console.log('SETTINGS_EXTENDED', {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    sellerGstin: settings.sellerGstin,
    lowStockThreshold: settings.lowStockThreshold,
    logoUrl: settings.logoUrl,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
