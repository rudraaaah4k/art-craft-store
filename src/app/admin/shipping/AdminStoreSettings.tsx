'use client'

import { useEffect, useState } from 'react'

type StoreSettings = {
  storeName: string
  storeEmail: string
  storePhone: string
  logoUrl: string
  sellerGstin: string
  currency: string
  gstPercent: number
  freeShippingThreshold: number
  codEnabled: boolean
  codMaxPaise: number
  codFeePaise: number
  returnWindowDays: number
  lowStockThreshold: number
}

const emptySettings: StoreSettings = {
  storeName: '',
  storeEmail: '',
  storePhone: '',
  logoUrl: '',
  sellerGstin: '',
  currency: 'INR',
  gstPercent: 12,
  freeShippingThreshold: 99900,
  codEnabled: true,
  codMaxPaise: 300000,
  codFeePaise: 500,
  returnWindowDays: 7,
  lowStockThreshold: 5,
}

export function AdminStoreSettings() {
  const [settings, setSettings] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings/store')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load store settings.')
        const data = await res.json()
        setSettings({ ...emptySettings, ...data })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load store settings.'))
      .finally(() => setLoading(false))
  }, [])

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to save store settings.')
      setSettings({ ...emptySettings, ...data })
      setMessage('Store settings saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save store settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setSettings((s) => ({ ...s, [name]: checked }))
    } else if (type === 'number') {
      setSettings((s) => ({ ...s, [name]: Number(value) }))
    } else {
      setSettings((s) => ({ ...s, [name]: value }))
    }
  }

  return (
    <section className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a684b]">Configuration</p>
        <h2 className="mt-1 font-serif text-2xl text-[#4a5d3a]">Store Settings</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#5b554d]">Configure your store identity, taxes, and commerce rules.</p>
      </div>

      {loading ? (
        <p className="text-sm text-[#5b554d]">Loading store settings…</p>
      ) : (
        <form onSubmit={save} className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-[#2b2b2b] border-b border-[#d8c7b1] pb-2">Identity & Contact</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Store Name
                <input required type="text" name="storeName" value={settings.storeName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">Store Email
                <input type="email" name="storeEmail" value={settings.storeEmail || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">Store Phone
                <input type="tel" name="storePhone" value={settings.storePhone || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">GSTIN (Seller)
                <input type="text" name="sellerGstin" value={settings.sellerGstin || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[#2b2b2b] border-b border-[#d8c7b1] pb-2">Commerce Rules</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Default GST %
                <input required type="number" min="0" max="100" name="gstPercent" value={settings.gstPercent} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">Free Shipping Threshold (paise)
                <input required type="number" min="0" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">COD Max Limit (paise)
                <input required type="number" min="0" name="codMaxPaise" value={settings.codMaxPaise} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">COD Fee (paise)
                <input required type="number" min="0" name="codFeePaise" value={settings.codFeePaise} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">Return Window (days)
                <input required type="number" min="0" name="returnWindowDays" value={settings.returnWindowDays} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="block text-sm font-medium">Low Stock Alert Threshold
                <input required type="number" min="0" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} className="mt-1 block w-full rounded-md border border-[#d8c7b1] px-3 py-2 outline-none focus:border-[#a94e28]" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2 pt-2">
                <input type="checkbox" name="codEnabled" checked={settings.codEnabled} onChange={handleChange} className="h-4 w-4 rounded border-[#d8c7b1] text-[#a94e28] focus:ring-[#a94e28]" />
                Enable Cash on Delivery (COD) Globally
              </label>
            </div>
          </div>

          {message && <p role="status" className="text-sm font-medium text-[#4a5d3a]">{message}</p>}
          {error && <p role="alert" className="text-sm font-medium text-[#a94e28]">{error}</p>}
          <button disabled={saving} className="min-h-11 rounded-md bg-[#a94e28] px-5 py-2.5 font-semibold text-white hover:bg-[#883e20] disabled:opacity-60">
            {saving ? 'Saving…' : 'Save store settings'}
          </button>
        </form>
      )}
    </section>
  )
}
