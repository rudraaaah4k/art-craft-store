import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { renderInvoicePdf, buildInvoiceData } from '@/lib/invoice'
import { z } from 'zod'

type Context = { params: Promise<{ id: string }> }
const orderIdSchema = z.string().trim().min(1).max(100)

export async function GET(_req: Request, { params }: Context) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsedId = orderIdSchema.safeParse(id)
  if (!parsedId.success) return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id: parsedId.data },
    include: { items: true },
  })
  if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 })

  const settings = await prisma.settings.findUnique({ where: { key: 'default' } })
  const data = buildInvoiceData(order, settings)
  const pdf = await renderInvoicePdf(data)

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${parsedId.data.slice(-8).toUpperCase()}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
