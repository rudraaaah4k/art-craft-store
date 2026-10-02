/**
 * GST Invoice generator (Phase 6b)
 * Uses @react-pdf/renderer to build a server-side PDF.
 *
 * GST rules (Indian e-commerce defaults):
 *  - Same state (buyer state === seller/pickup state): CGST + SGST (each = gstPercent/2)
 *  - Different state: IGST (= gstPercent)
 * Prices are GST-inclusive; we back-calculate the GST component from each line total.
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 40, color: '#2B2B2B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  storeName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#A85324' },
  storeAddress: { fontSize: 8, color: '#555', marginTop: 4, lineHeight: 1.4 },
  invoiceTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  invoiceMeta: { fontSize: 8, textAlign: 'right', color: '#555', lineHeight: 1.6 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4, borderBottom: '1 solid #E8DCC8', paddingBottom: 2 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 120, color: '#555' },
  value: { flex: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F6F1E8', padding: '4 6', borderRadius: 2, marginBottom: 2, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', padding: '3 6', borderBottom: '1 solid #E8DCC8' },
  totals: { marginTop: 8, alignSelf: 'flex-end', width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  totalRowBold: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, fontFamily: 'Helvetica-Bold', fontSize: 10, borderTop: '1 solid #2B2B2B', paddingTop: 4 },
  gstBox: { marginTop: 8, border: '1 solid #E8DCC8', padding: 6, borderRadius: 2 },
  gstRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, fontSize: 8 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 7.5, color: '#888', textAlign: 'center' },
})

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export interface InvoiceItem {
  title: string
  sku: string | null
  quantity: number
  unitPricePaise: number
  gstPercent: number
  totalPaise: number
}

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  orderId: string
  orderDate: Date
  // Seller
  sellerName: string
  sellerGstin?: string | null
  sellerAddress: string
  sellerState: string
  // Buyer
  buyerName: string
  buyerPhone: string
  buyerAddress: string
  buyerState: string
  // Order totals (stored on Order model, authoritative)
  items: InvoiceItem[]
  subtotalPaise: number
  discountPaise: number
  shippingPaise: number
  codFeePaise: number
  totalPaise: number
}

const col = StyleSheet.create({
  item: { flex: 4, fontSize: 8.5 },
  sku: { flex: 1, fontSize: 8.5 },
  qty: { flex: 0.6, fontSize: 8.5 },
  unit: { flex: 1.2, fontSize: 8.5 },
  gstPct: { flex: 0.8, fontSize: 8.5 },
  taxable: { flex: 1.2, fontSize: 8.5 },
  gstAmt: { flex: 1.2, fontSize: 8.5 },
  total: { flex: 1.2, fontSize: 8.5 },
})

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const sameState = data.sellerState.trim().toLowerCase() === data.buyerState.trim().toLowerCase()

  // GST breakup per item — back-calculated from GST-inclusive prices
  const gstBreakup = data.items.map((item) => {
    const gstAmount = Math.round(item.totalPaise * item.gstPercent / (100 + item.gstPercent))
    const taxableAmount = item.totalPaise - gstAmount
    return { ...item, gstAmount, taxableAmount }
  })
  const totalGst = gstBreakup.reduce((acc, i) => acc + i.gstAmount, 0)
  const totalTaxable = gstBreakup.reduce((acc, i) => acc + i.taxableAmount, 0)

  return (
    <Document title={`Invoice ${data.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>{data.sellerName}</Text>
            <Text style={styles.storeAddress}>{data.sellerAddress}</Text>
            {data.sellerGstin && <Text style={styles.storeAddress}>GSTIN: {data.sellerGstin}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceMeta}>Invoice No: {data.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>Invoice Date: {data.invoiceDate.toLocaleDateString('en-IN')}</Text>
            <Text style={styles.invoiceMeta}>Order ID: {data.orderId}</Text>
            <Text style={styles.invoiceMeta}>Order Date: {data.orderDate.toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 16 }}>
          <View style={{ flex: 1, border: '1 solid #E8DCC8', padding: 8, borderRadius: 2 }}>
            <Text style={styles.sectionTitle}>Bill To / Ship To</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{data.buyerName}</Text>
            <Text>{data.buyerAddress}</Text>
            <Text>State: {data.buyerState}</Text>
            <Text>Ph: {data.buyerPhone}</Text>
          </View>
          <View style={{ flex: 1, border: '1 solid #E8DCC8', padding: 8, borderRadius: 2 }}>
            <Text style={styles.sectionTitle}>Sold By</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{data.sellerName}</Text>
            <Text>{data.sellerAddress}</Text>
            <Text>State: {data.sellerState}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={col.item}>Item</Text>
          <Text style={col.sku}>SKU</Text>
          <Text style={col.qty}>Qty</Text>
          <Text style={col.unit}>Unit Price</Text>
          <Text style={col.gstPct}>GST %</Text>
          <Text style={col.taxable}>Taxable</Text>
          <Text style={col.gstAmt}>GST</Text>
          <Text style={col.total}>Total</Text>
        </View>
        {gstBreakup.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={col.item}>{item.title}</Text>
            <Text style={col.sku}>{item.sku ?? '—'}</Text>
            <Text style={col.qty}>{item.quantity}</Text>
            <Text style={col.unit}>{fmt(item.unitPricePaise)}</Text>
            <Text style={col.gstPct}>{item.gstPercent}%</Text>
            <Text style={col.taxable}>{fmt(item.taxableAmount)}</Text>
            <Text style={col.gstAmt}>{fmt(item.gstAmount)}</Text>
            <Text style={col.total}>{fmt(item.totalPaise)}</Text>
          </View>
        ))}

        {/* GST Summary Box */}
        <View style={styles.gstBox}>
          <Text style={{ ...styles.sectionTitle, marginBottom: 4 }}>
            GST Summary ({sameState ? 'Intra-State: CGST + SGST' : 'Inter-State: IGST'})
          </Text>
          <View style={styles.gstRow}>
            <Text>Taxable Value</Text>
            <Text>{fmt(totalTaxable)}</Text>
          </View>
          {sameState ? (
            <>
              <View style={styles.gstRow}>
                <Text>CGST (Central GST)</Text>
                <Text>{fmt(Math.round(totalGst / 2))}</Text>
              </View>
              <View style={styles.gstRow}>
                <Text>SGST (State GST)</Text>
                <Text>{fmt(totalGst - Math.round(totalGst / 2))}</Text>
              </View>
            </>
          ) : (
            <View style={styles.gstRow}>
              <Text>IGST (Integrated GST)</Text>
              <Text>{fmt(totalGst)}</Text>
            </View>
          )}
          <View style={{ ...styles.gstRow, fontFamily: 'Helvetica-Bold', borderTop: '1 solid #ccc', paddingTop: 2, marginTop: 2 }}>
            <Text>Total GST</Text>
            <Text>{fmt(totalGst)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal (incl. GST)</Text>
            <Text>{fmt(data.subtotalPaise)}</Text>
          </View>
          {data.discountPaise > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>-{fmt(data.discountPaise)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Shipping</Text>
            <Text>{data.shippingPaise === 0 ? 'FREE' : fmt(data.shippingPaise)}</Text>
          </View>
          {data.codFeePaise > 0 && (
            <View style={styles.totalRow}>
              <Text>COD Fee</Text>
              <Text>{fmt(data.codFeePaise)}</Text>
            </View>
          )}
          <View style={styles.totalRowBold}>
            <Text>TOTAL</Text>
            <Text>{fmt(data.totalPaise)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a computer-generated invoice and does not require a physical signature. All prices are GST-inclusive.
        </Text>
      </Page>
    </Document>
  )
}

/**
 * Render the invoice for an order and return the PDF as a Buffer.
 * The caller is responsible for fetching order data and building InvoiceData.
 */
export async function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  // @react-pdf requires ReactElement<DocumentProps>; InvoiceDocument roots in <Document>.
  const element = (<InvoiceDocument data={data} />) as React.ReactElement<
    React.ComponentProps<typeof Document>
  >
  const pdfBuffer = await renderToBuffer(element)
  return Buffer.from(pdfBuffer)
}

/**
 * Build InvoiceData from a Prisma order with items and settings.
 */
export function buildInvoiceData(
  order: {
    id: string
    email: string
    shippingFullName: string
    shippingPhone: string
    shippingLine1: string
    shippingLine2: string | null
    shippingCity: string
    shippingState: string
    shippingPostalCode: string
    subtotalPaise: number
    discountPaise: number
    shippingPaise: number
    codFeePaise: number
    totalPaise: number
    placedAt: Date
    items: {
      title: string
      sku: string | null
      quantity: number
      unitPricePaise: number
      gstPercent: number
      totalPaise: number
    }[]
  },
  settings: {
    storeName?: string | null
    sellerGstin?: string | null
    pickupName?: string | null
    pickupAddressLine1?: string | null
    pickupAddressLine2?: string | null
    pickupCity?: string | null
    pickupState?: string | null
    pickupPostalCode?: string | null
    pickupCountry?: string
  } | null
): InvoiceData {
  const sellerName = settings?.storeName || settings?.pickupName || 'ArtCraft Store'
  const sellerLines = [
    settings?.pickupAddressLine1,
    settings?.pickupAddressLine2,
    settings?.pickupCity,
    settings?.pickupState,
    settings?.pickupPostalCode,
  ].filter(Boolean).join(', ')
  const sellerAddress = sellerLines || 'India'
  const sellerState = settings?.pickupState ?? 'Maharashtra'

  const buyerAddressLines = [
    order.shippingLine1,
    order.shippingLine2,
    order.shippingCity,
    order.shippingPostalCode,
  ].filter(Boolean).join(', ')

  return {
    invoiceNumber: `INV-${order.id.slice(-8).toUpperCase()}`,
    invoiceDate: new Date(),
    orderId: order.id,
    orderDate: order.placedAt,
    sellerName,
    sellerGstin: settings?.sellerGstin ?? null,
    sellerAddress,
    sellerState,
    buyerName: order.shippingFullName,
    buyerPhone: order.shippingPhone,
    buyerAddress: buyerAddressLines,
    buyerState: order.shippingState,
    items: order.items,
    subtotalPaise: order.subtotalPaise,
    discountPaise: order.discountPaise,
    shippingPaise: order.shippingPaise,
    codFeePaise: order.codFeePaise,
    totalPaise: order.totalPaise,
  }
}
