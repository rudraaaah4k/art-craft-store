'use client'

import { useEffect, useState } from 'react'

type CourierRate = { id: string; courierName: string; amountPaise: number; estimatedDays: number; chargeableWeightGrams: number }
type Shipment = { id: string; trackingNumber: string | null; status: string; ratePaise: number; labelUrl: string | null; metadata: unknown }
type AdminOrder = { id: string; email: string; status: string; paymentStatus: string; totalPaise: number; shippingPostalCode: string; createdAt: string; items: Array<{ title: string; quantity: number }>; shipment: Shipment | null }
const nextStatus: Record<string, string> = { PACKED: 'SHIPPED', SHIPPED: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' }

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [rates, setRates] = useState<CourierRate[]>([])
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [selectedRateId, setSelectedRateId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadOrders() {
    const response = await fetch('/api/admin/orders', { cache: 'no-store' })
    if (!response.ok) throw new Error('Unable to load orders.')
    setOrders(await response.json())
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load orders.'))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function loadCouriers(orderId: string) {
    setActiveOrderId(orderId)
    setRates([])
    setSelectedRateId('')
    setMessage('')
    setError('')
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/couriers`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to list couriers.')
      setRates(data.rates)
      setSelectedRateId(data.rates[0]?.id ?? '')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to list couriers.')
    } finally {
      setBusy(false)
    }
  }

  async function createShipment(orderId: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierId: selectedRateId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to create mock shipment.')
      setMessage(`Mock shipment created. AWB ${data.trackingNumber}. Pickup scheduled.`)
      setActiveOrderId(null)
      setRates([])
      await loadOrders()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create mock shipment.')
    } finally {
      setBusy(false)
    }
  }

  async function simulateScan(orderId: string, status: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to update mock tracking status.')
      setMessage(`Mock courier scan updated to ${status.replaceAll('_', ' ').toLowerCase()}.`)
      await loadOrders()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update mock tracking status.')
    } finally {
      setBusy(false)
    }
  }

  async function issueRefund(orderId: string, currentStatus: string) {
    if (!['PAID', 'AUTHORIZED', 'PARTIALLY_REFUNDED'].includes(currentStatus)) {
      setError('Only paid or partially refunded orders can be refunded.')
      return
    }
    const amt = window.prompt('Enter refund amount in ₹ (leave blank for FULL refund):')
    if (amt === null) return // cancelled

    let payload: { amountPaise?: number } = {}
    if (amt.trim() !== '') {
      const p = Math.round(parseFloat(amt) * 100)
      if (isNaN(p) || p <= 0) {
        setError('Invalid refund amount.')
        return
      }
      payload = { amountPaise: p }
    }

    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Refund failed.')
      setMessage(`Refund successful. Status: ${data.paymentStatus ?? data.status}`)
      await loadOrders()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Refund failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a684b]">Fulfillment</p>
        <h2 className="mt-1 font-serif text-2xl text-[#4a5d3a]">Orders & shipments</h2>
      </div>
      {message && <p role="status" className="mb-4 text-sm font-medium text-[#4a5d3a]">{message}</p>}
      {error && <p role="alert" className="mb-4 text-sm font-medium text-[#a94e28]">{error}</p>}
      {orders.length === 0 ? <p className="text-sm text-[#5b554d]">No orders found.</p> : (
        <div className="space-y-4">
          {orders.map((order) => {
            const shipmentMeta = order.shipment?.metadata && typeof order.shipment.metadata === 'object' ? order.shipment.metadata as Record<string, unknown> : {}
            return (
              <article key={order.id} className="border border-[#d8c7b1] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#2b2b2b]">Order {order.id}</p>
                    <p className="mt-1 text-sm text-[#5b554d]">{order.email} · {order.shippingPostalCode} · {order.status} / {order.paymentStatus}</p>
                    <p className="mt-1 text-sm text-[#5b554d]">{order.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')} · {money(order.totalPaise)}</p>
                    <div className="mt-3 flex gap-3 text-sm font-semibold">
                      <a href={`/api/admin/orders/${order.id}/invoice`} target="_blank" className="text-[#4a5d3a] hover:underline">
                        Invoice
                      </a>
                      {['PAID', 'AUTHORIZED', 'PARTIALLY_REFUNDED'].includes(order.paymentStatus) && (
                        <button onClick={() => void issueRefund(order.id, order.paymentStatus)} disabled={busy} className="text-[#a94e28] hover:underline disabled:opacity-50">
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
                  {order.shipment ? (
                    <div className="text-right text-sm">
                      <p className="font-semibold">{typeof shipmentMeta.courierName === 'string' ? shipmentMeta.courierName : 'Mock Courier'}</p>
                      <p>{order.shipment.status} · AWB {order.shipment.trackingNumber}</p>
                      {order.shipment.labelUrl && <a className="text-[#a94e28] underline" href={order.shipment.labelUrl}>Download mock label</a>}
                      {nextStatus[order.shipment.status] && <button disabled={busy} onClick={() => void simulateScan(order.id, nextStatus[order.shipment!.status])} className="mt-2 block rounded-md border border-[#c9b79f] px-3 py-2 text-xs font-semibold hover:bg-[#f0e6d8] disabled:opacity-60">Simulate {nextStatus[order.shipment.status].replaceAll('_', ' ').toLowerCase()} scan</button>}
                    </div>
                  ) : !['PAID', 'AUTHORIZED'].includes(order.paymentStatus) ? (
                    <span className="text-sm text-[#8a684b]">Payment required</span>
                  ) : (
                    <button disabled={busy} onClick={() => void loadCouriers(order.id)} className="min-h-10 rounded-md bg-[#a94e28] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {busy && activeOrderId === order.id ? 'Loading couriers…' : 'Create Shipment'}
                    </button>
                  )}
                </div>
                {activeOrderId === order.id && rates.length > 0 && (
                  <div className="mt-4 border-t border-[#eadfce] pt-4">
                    <p className="mb-3 text-sm font-semibold">Choose a mock courier</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {rates.map((rate) => (
                        <label key={rate.id} className="flex cursor-pointer items-start gap-3 border border-[#d8c7b1] p-3 text-sm">
                          <input type="radio" name={`courier-${order.id}`} checked={selectedRateId === rate.id} onChange={() => setSelectedRateId(rate.id)} className="mt-1" />
                          <span><span className="block font-semibold">{rate.courierName}</span><span className="text-[#5b554d]">{money(rate.amountPaise)} · {rate.estimatedDays} days · {rate.chargeableWeightGrams} g</span></span>
                        </label>
                      ))}
                    </div>
                    <button disabled={busy || !selectedRateId} onClick={() => void createShipment(order.id)} className="mt-4 min-h-10 rounded-md bg-[#4a5d3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {busy ? 'Creating mock shipment…' : 'Create mock shipment & schedule pickup'}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}