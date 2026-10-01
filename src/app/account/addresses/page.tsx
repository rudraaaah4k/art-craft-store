'use client'

import { useEffect, useState } from 'react'

type Address = { id: string; label: string | null; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; isDefault: boolean }
const empty = { label: '', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', isDefault: false }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState('')
  async function load() { const response = await fetch('/api/addresses'); if (response.ok) setAddresses(await response.json()) }
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [])
  async function save(event: React.FormEvent) { event.preventDefault(); const response = await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (response.ok) { setForm(empty); setMessage('Address saved.'); await load() } else setMessage('Unable to save address.') }
  async function remove(id: string) { await fetch(`/api/addresses/${id}`, { method: 'DELETE' }); await load() }
  return <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12"><h1 className="text-3xl font-serif font-bold mb-8">Saved Addresses</h1><div className="grid gap-8 md:grid-cols-2"><form onSubmit={save} className="space-y-3 border border-sand bg-white p-6"><h2 className="font-serif text-xl font-bold">Add address</h2>{(['label', 'fullName', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode'] as const).map((name) => <input key={name} required={name !== 'label' && name !== 'line2'} placeholder={name} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="w-full border border-sand p-3" />)}<label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Make default</label><button className="bg-terracotta text-white px-5 py-3">Save address</button>{message && <p className="text-sm text-deep-olive">{message}</p>}</form><div className="space-y-3">{addresses.map((address) => <div key={address.id} className="border border-sand bg-white p-5"><p className="font-medium">{address.label || 'Address'} {address.isDefault && <span className="text-xs text-deep-olive">Default</span>}</p><p className="text-sm text-charcoal/70 mt-2">{address.fullName}<br />{address.line1}{address.line2 && <><br />{address.line2}</>}<br />{address.city}, {address.state} {address.postalCode}<br />{address.phone}</p><button onClick={() => void remove(address.id)} className="mt-3 text-sm text-terracotta hover:underline">Delete</button></div>)}</div></div></div>
}