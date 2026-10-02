'use client'

import { useState } from 'react'

type ReportRow = {
  period: string
  orders: number
  revenueRupees: string
  discountRupees: string
  shippingRupees: string
  gstRupees: string
}

type ReportData = {
  from: string
  to: string
  groupBy: 'day' | 'month'
  rows: ReportRow[]
}

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day')

  function fetchReport() {
    setLoading(true)
    const params = new URLSearchParams()
    if (from) params.set('from', new Date(from).toISOString())
    if (to) params.set('to', new Date(to).toISOString())
    params.set('groupBy', groupBy)

    fetch(`/api/admin/reports/sales?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load report')
        return res.json()
      })
      .then((res) => {
        setData(res)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function getExportUrl() {
    const params = new URLSearchParams()
    if (from) params.set('from', new Date(from).toISOString())
    if (to) params.set('to', new Date(to).toISOString())
    params.set('groupBy', groupBy)
    params.set('format', 'csv')
    return `/api/admin/reports/sales?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-[#4a5d3a]">Sales Reports</h2>
        {data && (
          <a
            href={getExportUrl()}
            target="_blank"
            className="rounded-xl bg-[#2b2b2b] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Export CSV
          </a>
        )}
      </div>

      <div className="rounded-xl border border-[#d8c7b1] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#555]">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] px-3 py-2 text-sm focus:border-[#a94e28] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#555]">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] px-3 py-2 text-sm focus:border-[#a94e28] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#555]">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'month')}
              className="rounded-xl border border-[#d8c7b1] bg-[#fffaf3] px-3 py-2 text-sm focus:border-[#a94e28] focus:outline-none"
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
            </select>
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="rounded-xl bg-[#c4622d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a94e28] disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <div className="p-4 text-[#a94e28]">{error}</div>}

      {data && (
        <div className="overflow-x-auto rounded-xl border border-[#d8c7b1] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6f1e8] text-[#555]">
              <tr>
                <th className="p-3 font-medium">Period</th>
                <th className="p-3 font-medium">Orders</th>
                <th className="p-3 font-medium">Revenue</th>
                <th className="p-3 font-medium">Discount</th>
                <th className="p-3 font-medium">Shipping</th>
                <th className="p-3 font-medium">GST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dcc8]">
              {data.rows.map((r) => (
                <tr key={r.period}>
                  <td className="p-3 font-medium">{r.period}</td>
                  <td className="p-3">{r.orders}</td>
                  <td className="p-3">₹{Number(r.revenueRupees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-[#991b1b]">-₹{Number(r.discountRupees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3">₹{Number(r.shippingRupees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-[#555]">₹{Number(r.gstRupees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-[#555]">No sales in this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
