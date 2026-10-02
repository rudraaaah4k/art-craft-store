import Link from 'next/link'
import type { Shipment } from '@prisma/client'

const steps = [
  { status: 'PACKED', label: 'Packed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
] as const

type TimelineEntry = { status: string; at: string }

function metadataRecord(value: Shipment['metadata']): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export function ShipmentTracking({ shipment, showTrackingLink = true }: { shipment: Shipment; showTrackingLink?: boolean }) {
  const metadata = metadataRecord(shipment.metadata)
  const courierName = typeof metadata.courierName === 'string' ? metadata.courierName : 'Mock Courier'
  const trackingUrl = typeof metadata.trackingUrl === 'string' ? metadata.trackingUrl : null
  const timeline = Array.isArray(metadata.timeline)
    ? metadata.timeline.filter((entry): entry is TimelineEntry => Boolean(entry && typeof entry === 'object' && 'status' in entry && 'at' in entry && typeof entry.status === 'string' && typeof entry.at === 'string'))
    : []
  const currentIndex = steps.findIndex((step) => step.status === shipment.status)

  return (
    <section id="shipment-tracking" className="mt-8 border border-sand bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl font-bold text-charcoal">Shipment tracking</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-charcoal/60">Courier</dt><dd className="font-medium">{courierName}</dd></div>
        <div><dt className="text-charcoal/60">AWB</dt><dd className="font-mono font-medium">{shipment.trackingNumber || 'Pending'}</dd></div>
        <div><dt className="text-charcoal/60">Status</dt><dd className="font-medium">{steps.find((step) => step.status === shipment.status)?.label ?? shipment.status}</dd></div>
      </dl>
      {showTrackingLink && trackingUrl && <Link href={trackingUrl} className="mt-4 inline-block text-sm font-medium text-terracotta underline">Open tracking page</Link>}
      <ol className="mt-6 grid gap-3 sm:grid-cols-4">
        {steps.map((step, index) => {
          const event = timeline.find((entry) => entry.status === step.status)
          const completed = index <= currentIndex
          return <li key={step.status} className={`border-l-2 pl-3 text-sm ${completed ? 'border-deep-olive text-charcoal' : 'border-sand text-charcoal/45'}`}>
            <span className="block font-medium">{step.label}</span>
            {event && <time className="mt-1 block text-xs text-charcoal/55" dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>}
          </li>
        })}
      </ol>
    </section>
  )
}