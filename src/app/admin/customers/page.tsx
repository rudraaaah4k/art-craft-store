'use client'

import { useEffect, useState } from 'react'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  paidOrders: number
  totalSpentRupees: string
  memberSince: string
}

type CustomersData = {
  customers: Customer[]
  total: number
  page: number
  limit: number
  pages: number
}

export default function AdminCustomers() {
  const [data, setData] = useState<CustomersData | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    fetch(`/api/admin/customers?page=${page}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load customers data')
        return res.json()
      })
      .then((res: CustomersData) => {
        if (cancelled) return
        setData(res)
        setError('')
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return
        setError(err instanceof Error ? err.message : 'Unable to load customers data')
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [page])

  if (error) return <div className="p-4 text-[#a94e28]">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-[#4a5d3a]">Customers</h2>
        <a
          href="/api/admin/customers?format=csv"
          target="_blank"
          className="rounded-xl bg-[#2b2b2b] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#d8c7b1] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f6f1e8] text-[#555]">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Total Orders (Paid)</th>
              <th className="p-3 font-medium">Total Spent</th>
              <th className="p-3 font-medium">Member Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dcc8]">
            {loading && !data && (
              <tr><td colSpan={5} className="p-6 text-center text-[#555]">Loading...</td></tr>
            )}
            {data?.customers.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.name || 'Guest'}</td>
                <td className="p-3">
                  <div>{c.email}</div>
                  {c.phone && <div className="text-xs text-[#888]">{c.phone}</div>}
                </td>
                <td className="p-3">{c.totalOrders} ({c.paidOrders})</td>
                <td className="p-3">₹{Number(c.totalSpentRupees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="p-3 text-[#555]">{new Date(c.memberSince).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {data?.customers.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-[#555]">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setLoading(true)
              setPage((p) => Math.max(1, p - 1))
            }}
            disabled={page === 1 || loading}
            className="rounded border border-[#d8c7b1] px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-[#555]">
            Page {page} of {data.pages}
          </span>
          <button
            onClick={() => {
              setLoading(true)
              setPage((p) => Math.min(data.pages, p + 1))
            }}
            disabled={page === data.pages || loading}
            className="rounded border border-[#d8c7b1] px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
