import { NextResponse } from 'next/server'
import { getAdminApiSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Context = { params: Promise<{ id: string }> }
const orderIdSchema = z.string().trim().min(1).max(100)

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

export async function GET(_request: Request, { params }: Context) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsedId = orderIdSchema.safeParse(id)
  if (!parsedId.success) return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { id: parsedId.data }, include: { shipment: true } })
  if (!order?.shipment) return NextResponse.json({ message: 'Shipment label is not available.' }, { status: 404 })

  const metadata = order.shipment.metadata && typeof order.shipment.metadata === 'object' ? order.shipment.metadata : {}
  const courierName = 'courierName' in metadata && typeof metadata.courierName === 'string' ? metadata.courierName : 'Mock Courier'
  const text = [order.shippingFullName, order.shippingLine1, order.shippingLine2, `${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}`, order.shippingPhone]
    .filter(Boolean)
    .join(' · ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="white"/><rect x="16" y="16" width="768" height="418" fill="none" stroke="#2b2b2b" stroke-width="2"/><text x="40" y="60" font-family="sans-serif" font-size="24" font-weight="bold">ArtCraft · MOCK SHIPPING LABEL</text><text x="40" y="112" font-family="sans-serif" font-size="18">Order ${escapeXml(order.id)}</text><text x="40" y="155" font-family="sans-serif" font-size="16">Courier: ${escapeXml(courierName)}</text><text x="40" y="205" font-family="sans-serif" font-size="16">Deliver to:</text><foreignObject x="40" y="220" width="700" height="100"><div xmlns="http://www.w3.org/1999/xhtml" style="font:16px sans-serif;word-break:break-word">${escapeXml(text)}</div></foreignObject><text x="40" y="375" font-family="monospace" font-size="22">AWB: ${escapeXml(order.shipment.trackingNumber ?? '')}</text></svg>`
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="mock-label-${order.id}.svg"`,
      'Cache-Control': 'no-store',
    },
  })
}