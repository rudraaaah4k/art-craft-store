'use client'

import { useEffect, useState } from 'react'

type PickupAddress = {
  pickupName: string
  pickupEmail: string
  pickupPhone: string
  pickupAddressLine1: string
  pickupAddressLine2: string
  pickupCity: string
  pickupState: string
  pickupPostalCode: string
  pickupCountry: string
}

const emptyAddress: PickupAddress = {
  pickupName: '',
  pickupEmail: '',
  pickupPhone: '',
  pickupAddressLine1: '',
  pickupAddressLine2: '',
  pickupCity: '',
  pickupState: '',
  pickupPostalCode: '',
  pickupCountry: 'India',
}

const fields: Array<{ key: keyof PickupAddress; label: string; type?: string; required?: boolean }> = [
  { key: 'pickupName', label: 'Pickup contact name', required: true },
  { key: 'pickupEmail', label: 'Pickup email', type: 'email', required: true },
  { key: 'pickupPhone', label: 'Pickup phone', type: 'tel', required: true },
  { key: 'pickupAddressLine1', label: 'Address line 1', required: true },
  { key: 'pickupAddressLine2', label: 'Address line 2' },
  { key: 'pickupCity', label: 'City', required: true },
  { key: 'pickupState', label: 'State', required: true },
  { key: 'pickupPostalCode', label: 'Pincode', required: true },
  { key: 'pickupCountry', label: 'Country', required: true },
]

export function AdminShippingSettings() {
  const [address, setAddress] = useState(emptyAddress)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/settings/shipping')
        .then(async (response) => {
          if (!response.ok) throw new Error('Unable to load pickup settings.')
          setAddress({ ...emptyAddress, ...await response.json() })
        })
        .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load pickup settings.'))
        .finally(() => setLoading(false))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/admin/settings/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      })
      const data = await response.json()
      if (!response.ok) {
        const errors = Object.values(data.issues?.fieldErrors ?? {}).flat()
        throw new Error(errors[0] ?? data.message ?? 'Unable to save pickup settings.')
      }
      setAddress({ ...emptyAddress, ...data })
      setMessage('Pickup address saved.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save pickup settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a684b]">Fulfillment</p>
        <h2 className="mt-1 font-serif text-2xl text-[#4a5d3a]">Pickup address</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#5b554d]">This address identifies where a courier collects shipments. Configure it before creating shipments.</p>
      </div>

      {loading ? <p className="text-sm text-[#5b554d]">Loading pickup settings…</p> : (
        <form onSubmit={save} className="max-w-3xl space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className={`block text-sm font-medium text-[#2b2b2b] ${field.key === 'pickupAddressLine1' || field.key === 'pickupAddressLine2' ? 'sm:col-span-2' : ''}`}>
                {field.label}
                <input
                  required={field.required}
                  type={field.type ?? 'text'}
                  value={address[field.key]}
                  onChange={(event) => setAddress({ ...address, [field.key]: event.target.value })}
                  className="mt-1 min-h-11 w-full rounded-md border border-[#d8c7b1] bg-white px-3 py-2.5 outline-none focus:border-[#a94e28] focus:ring-2 focus:ring-[#a94e28]/20"
                />
              </label>
            ))}
          </div>
          {message && <p role="status" className="text-sm font-medium text-[#4a5d3a]">{message}</p>}
          {error && <p role="alert" className="text-sm font-medium text-[#a94e28]">{error}</p>}
          <button disabled={saving} className="min-h-11 rounded-md bg-[#a94e28] px-5 py-2.5 font-semibold text-white hover:bg-[#883e20] disabled:opacity-60">
            {saving ? 'Saving…' : 'Save pickup address'}
          </button>
        </form>
      )}
    </section>
  )
}