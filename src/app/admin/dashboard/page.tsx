'use client'

import { useEffect, useState } from 'react'

type DashboardData = {
  ordersToday: number
  ordersThisMonth: number
  revenueTodayPaise: number
  revenueThisMonthPaise: number
  totalRevenuePaise: number
  totalOrders: number
  recentOrders: Array<{ id: string; email: string; status: string; paymentStatus: string; totalPaise: number; shippingFullName: string; createdAt: string }>
  lowStock: Array<{ type: string; id: string; name: string; sku: string | null; stock: number }>
}

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load dashboard data')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="p-4 text-[#a94e28]">{error}</div>
  if (!data) return <div className="p-4 text-[#555]">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-[#4a5d3a]">Store Overview</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#d8c7b1] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#555]">Revenue Today</p>
          <p className="text-2xl font-bold text-[#4a5d3a]">{fmt(data.revenueTodayPaise)}</p>
        </div>
        <div className="rounded-xl border border-[#d8c7b1] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#555]">Orders Today</p>
          <p className="text-2xl font-bold text-[#4a5d3a]">{data.ordersToday}</p>
        </div>
        <div className="rounded-xl border border-[#d8c7b1] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#555]">Revenue This Month</p>
          <p className="text-2xl font-bold text-[#4a5d3a]">{fmt(data.revenueThisMonthPaise)}</p>
        </div>
        <div className="rounded-xl border border-[#d8c7b1] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#555]">Total Revenue</p>
          <p className="text-2xl font-bold text-[#4a5d3a]">{fmt(data.totalRevenuePaise)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-xl text-[#4a5d3a]">Recent Orders</h3>
          <div className="overflow-x-auto rounded-xl border border-[#d8c7b1] bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f1e8] text-[#555]">
                <tr>
                  <th className="p-3 font-medium">Order ID</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8dcc8]">
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-3 font-mono text-xs">{order.id.slice(-8).toUpperCase()}</td>
                    <td className="p-3">
                      <div>{order.shippingFullName}</div>
                      <div className="text-xs text-[#888]">{order.email}</div>
                    </td>
                    <td className="p-3 text-[#555]">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-3">{fmt(order.totalPaise)}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-[#555]">No recent orders.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-xl text-[#4a5d3a]">Low Stock Alerts</h3>
          <div className="rounded-xl border border-[#d8c7b1] bg-white shadow-sm p-4">
            {data.lowStock.length > 0 ? (
              <ul className="divide-y divide-[#e8dcc8]">
                {data.lowStock.map((item) => (
                  <li key={item.id} className="py-3 flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#2b2b2b]">{item.name}</p>
                      {item.sku && <p className="text-xs text-[#888]">SKU: {item.sku}</p>}
                    </div>
                    <span className="shrink-0 rounded bg-[#fee2e2] px-2 py-1 text-xs font-bold text-[#991b1b]">
                      {item.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#555]">All stock levels are healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
