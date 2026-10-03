'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Totals = { subtotalPaise: number; discountPaise: number; shippingPaise: number; gstPaise: number; codFeePaise: number; totalPaise: number; codAllowed: boolean; weightGrams: number; courierName: string; estimatedDeliveryDays: number }
type SavedAddress = { id: string; label: string | null; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; postalCode: string }

const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`

export function CheckoutClient() {
  const [form, setForm] = useState({ email: '', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', couponCode: '', addressId: '', paymentMethod: 'RAZORPAY' as 'RAZORPAY' | 'COD' })
  const [totals, setTotals] = useState<Totals | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const router = useRouter()

  useEffect(() => { const timer = window.setTimeout(() => { void fetch('/api/addresses').then(async (response) => { if (response.ok) setSavedAddresses(await response.json()) }) }, 0); return () => window.clearTimeout(timer) }, [])

  function selectAddress(address: SavedAddress) {
    setForm({ ...form, addressId: address.id, fullName: address.fullName, phone: address.phone, line1: address.line1, line2: address.line2 ?? '', city: address.city, state: address.state, postalCode: address.postalCode })
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!/^\d{6}$/.test(form.postalCode)) {
        setTotals(null)
        setError(form.postalCode ? 'Enter a valid 6-digit pincode to check delivery.' : '')
        return
      }
      void fetch('/api/checkout/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postalCode: form.postalCode, couponCode: form.couponCode, paymentMethod: form.paymentMethod }) })
        .then(async (response) => {
          const data = await response.json()
          if (!response.ok) { setTotals(null); setError(data.error) }
          else { setTotals(data.totals); setError('') }
        })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [form.postalCode, form.couponCode, form.paymentMethod])

  async function submitOrder(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch('/api/checkout/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, addressId: form.addressId || undefined }) })
    const data = await response.json()
    if (!response.ok) { setError(data.error); setLoading(false); return }
    const paymentResponse = await fetch('/api/payments/razorpay/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: data.orderId }) })
    const payment = await paymentResponse.json()
    if (!paymentResponse.ok) { setError(payment.error); setLoading(false); return }
    if (payment.mock) { router.push(`/orders/${data.orderId}`); return }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const RazorpayConstructor = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: unknown) => void) => void } }).Razorpay
      const checkout = new RazorpayConstructor({
        key: payment.keyId,
        amount: payment.amountPaise,
        currency: payment.currency,
        name: 'ArtCraft',
        description: `Order ${data.orderId}`,
        order_id: payment.razorpayOrderId,
        prefill: { name: form.fullName, email: form.email, contact: `+91${form.phone}` },
        handler: async (paymentResult: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyResponse = await fetch('/api/payments/razorpay/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: data.orderId, razorpayOrderId: paymentResult.razorpay_order_id, razorpayPaymentId: paymentResult.razorpay_payment_id, razorpaySignature: paymentResult.razorpay_signature }) })
          if (verifyResponse.ok) router.push(`/orders/${data.orderId}`)
          else { setError('Payment verification failed.'); setLoading(false) }
        },
      })
      checkout.on('payment.failed', async () => {
        await fetch('/api/payments/razorpay/failure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: data.orderId }) })
        setError('Payment failed. Your stock reservation has been released.')
        setLoading(false)
      })
      checkout.open()
    }
    script.onerror = () => { setError('Unable to load Razorpay Checkout.'); setLoading(false) }
    document.body.appendChild(script)
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submitOrder} className="space-y-5">
          {savedAddresses.length > 0 && <div className="border border-sand bg-white p-4"><label className="text-sm font-medium">Use a saved address<select onChange={(event) => { const address = savedAddresses.find((item) => item.id === event.target.value); if (address) selectAddress(address) }} className="mt-1 w-full border border-sand p-3"><option value="">Choose address</option>{savedAddresses.map((address) => <option key={address.id} value={address.id}>{address.label || address.fullName} · {address.postalCode}</option>)}</select></label></div>}
          <div className="grid gap-4 sm:grid-cols-2">
            {([['email', 'Email', 'email'], ['fullName', 'Full name', 'text'], ['phone', 'Phone', 'tel'], ['postalCode', 'Pincode', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text']] as const).map(([name, label, type]) => <label key={name} className="text-sm font-medium">{label}<input required type={type} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="mt-1 w-full border border-sand p-3 bg-white" /></label>)}
          </div>
          <label className="text-sm font-medium block">Address line 1<input required value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} className="mt-1 w-full border border-sand p-3 bg-white" /></label>
          <label className="text-sm font-medium block">Address line 2<input value={form.line2} onChange={(event) => setForm({ ...form, line2: event.target.value })} className="mt-1 w-full border border-sand p-3 bg-white" /></label>
          <label className="text-sm font-medium block">Coupon code<input value={form.couponCode} onChange={(event) => setForm({ ...form, couponCode: event.target.value.toUpperCase() })} className="mt-1 w-full border border-sand p-3 bg-white" /></label>
          <fieldset><legend className="text-sm font-medium mb-2">Payment method</legend><div className="flex gap-4"><label className="border border-sand p-3"><input type="radio" checked={form.paymentMethod === 'RAZORPAY'} onChange={() => setForm({ ...form, paymentMethod: 'RAZORPAY' })} /> Razorpay</label><label className="border border-sand p-3"><input type="radio" checked={form.paymentMethod === 'COD'} onChange={() => setForm({ ...form, paymentMethod: 'COD' })} /> Cash on Delivery</label></div></fieldset>
          {error && (
            <div className="bg-terracotta/5 border border-terracotta/20 p-4 rounded text-terracotta flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}
          <button disabled={loading || !totals} className="w-full sm:w-auto bg-terracotta text-white px-8 py-3 font-medium disabled:opacity-70 disabled:cursor-not-allowed hover:bg-charcoal transition-colors rounded flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {loading ? 'Processing...' : 'Place order'}
          </button>
        </form>
        <aside className="border border-sand bg-white p-6 h-fit"><h2 className="font-serif text-xl font-bold mb-5">Order Summary</h2>{totals ? <div className="space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotalPaise)}</span></div><div className="flex justify-between"><span>GST included</span><span>{money(totals.gstPaise)}</span></div><div className="flex justify-between"><span>Shipping · {totals.courierName}, {totals.estimatedDeliveryDays} days</span><span>{money(totals.shippingPaise)}</span></div>{totals.discountPaise > 0 && <div className="flex justify-between text-deep-olive"><span>Discount</span><span>-{money(totals.discountPaise)}</span></div>}{totals.codFeePaise > 0 && <div className="flex justify-between"><span>COD fee</span><span>{money(totals.codFeePaise)}</span></div>}<div className="border-t border-sand pt-3 flex justify-between font-bold text-lg"><span>Total</span><span>{money(totals.totalPaise)}</span></div><p className="text-xs text-charcoal/60">Mock estimate · {totals.weightGrams} g total weight</p></div> : <p className="text-charcoal/60">Enter a valid pincode to calculate delivery.</p>}<Link href="/cart" className="block mt-6 text-sm text-terracotta hover:underline">Back to cart</Link></aside>
      </div>
    </div>
  )
}