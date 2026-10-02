/**
 * Authenticated Phase 6 API smoke tests against local Next.js.
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000'

async function getCsrf(cookieJar: Map<string, string>) {
  const res = await fetch(`${BASE}/api/auth/csrf`, { headers: { Cookie: cookieHeader(cookieJar) } })
  captureCookies(res, cookieJar)
  const data = (await res.json()) as { csrfToken: string }
  return data.csrfToken
}

function cookieHeader(jar: Map<string, string>) {
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

function captureCookies(res: Response, jar: Map<string, string>) {
  const raw = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
  for (const line of raw) {
    const [pair] = line.split(';')
    const eq = pair.indexOf('=')
    if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1))
  }
}

async function loginAdmin(jar: Map<string, string>) {
  const csrfToken = await getCsrf(jar)
  const body = new URLSearchParams({
    csrfToken,
    email: 'admin@artwebsite.com',
    password: 'admin123',
    callbackUrl: `${BASE}/admin`,
    json: 'true',
  })
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieHeader(jar),
    },
    body,
    redirect: 'manual',
  })
  captureCookies(res, jar)
  console.log('LOGIN_STATUS', res.status)
  return res.status
}

async function main() {
  const jar = new Map<string, string>()
  await loginAdmin(jar)
  const cookie = cookieHeader(jar)

  const dash = await fetch(`${BASE}/api/admin/dashboard`, { headers: { Cookie: cookie } })
  const dashJson = (await dash.json()) as Record<string, unknown>
  console.log('DASHBOARD', dash.status, {
    totalOrders: dashJson.totalOrders,
    totalRevenuePaise: dashJson.totalRevenuePaise,
    lowStock: Array.isArray(dashJson.lowStock) ? dashJson.lowStock.length : 'n/a',
    lowStockThreshold: dashJson.lowStockThreshold,
  })

  const customers = await fetch(`${BASE}/api/admin/customers`, { headers: { Cookie: cookie } })
  const customersJson = (await customers.json()) as {
    total: number
    customers?: Array<{ email: string; totalOrders: number; totalSpentRupees: string }>
  }
  console.log('CUSTOMERS', customers.status, {
    total: customersJson.total,
    first: customersJson.customers?.[0]
      ? {
          email: customersJson.customers[0].email,
          totalOrders: customersJson.customers[0].totalOrders,
          totalSpentRupees: customersJson.customers[0].totalSpentRupees,
        }
      : null,
  })

  const reports = await fetch(`${BASE}/api/admin/reports/sales?groupBy=day&format=json`, {
    headers: { Cookie: cookie },
  })
  const reportsJson = (await reports.json()) as { rows?: unknown[] }
  console.log('REPORTS', reports.status, { rows: reportsJson.rows?.length })

  const csv = await fetch(`${BASE}/api/admin/reports/sales?groupBy=day&format=csv`, {
    headers: { Cookie: cookie },
  })
  const csvBytes = new Uint8Array(await csv.arrayBuffer())
  const bomOk = csvBytes[0] === 0xef && csvBytes[1] === 0xbb && csvBytes[2] === 0xbf
  console.log('CSV', csv.status, {
    bomOk,
    contentType: csv.headers.get('content-type'),
    firstBytes: Array.from(csvBytes.slice(0, 3)),
  })

  const orders = await fetch(`${BASE}/api/admin/orders`, { headers: { Cookie: cookie } })
  const list = (await orders.json()) as Array<{
    id: string
    paymentStatus: string
    totalPaise: number
    payment: { id: string; status: string; amountPaise: number } | null
  }>
  const refundable = list.find(
    (o) =>
      o.payment &&
      ['PAID', 'PARTIALLY_REFUNDED'].includes(o.paymentStatus) &&
      ['CAPTURED', 'PARTIALLY_REFUNDED'].includes(o.payment.status)
  )
  console.log('ORDERS', orders.status, { count: list.length, refundableId: refundable?.id })

  if (refundable?.id) {
    const inv = await fetch(`${BASE}/api/admin/orders/${refundable.id}/invoice`, {
      headers: { Cookie: cookie },
    })
    const buf = Buffer.from(await inv.arrayBuffer())
    console.log('INVOICE', inv.status, {
      contentType: inv.headers.get('content-type'),
      bytes: buf.byteLength,
      pdfHeader: buf.slice(0, 5).toString('utf8'),
    })

    const over = await fetch(`${BASE}/api/admin/orders/${refundable.id}/refund`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountPaise: refundable.payment!.amountPaise + 1 }),
    })
    const overJson = (await over.json()) as { message?: string }
    console.log('REFUND_OVER', over.status, overJson.message)

    const partial = await fetch(`${BASE}/api/admin/orders/${refundable.id}/refund`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountPaise: 100, reason: 'other', notes: 'phase6 verify' }),
    })
    const partialJson = (await partial.json()) as {
      message?: string
      amountPaise?: number
      remainingPaise?: number
      paymentStatus?: string
    }
    console.log('REFUND_PARTIAL', partial.status, partialJson)

    if (partial.ok && typeof partialJson.remainingPaise === 'number') {
      const again = await fetch(`${BASE}/api/admin/orders/${refundable.id}/refund`, {
        method: 'POST',
        headers: { Cookie: cookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaise: partialJson.remainingPaise + 1 }),
      })
      const againJson = (await again.json()) as { message?: string }
      console.log('REFUND_EXCEED_AFTER_PARTIAL', again.status, againJson.message)
    }
  }

  const settingsGet = await fetch(`${BASE}/api/admin/settings/store`, { headers: { Cookie: cookie } })
  const settingsJson = (await settingsGet.json()) as { storeName?: string; lowStockThreshold?: number }
  console.log('SETTINGS_GET', settingsGet.status, {
    storeName: settingsJson.storeName,
    lowStockThreshold: settingsJson.lowStockThreshold,
  })

  for (const path of ['/admin/dashboard', '/admin/customers', '/admin/reports', '/admin/orders', '/admin/shipping']) {
    const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie }, redirect: 'manual' })
    console.log('PAGE', path, res.status)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
