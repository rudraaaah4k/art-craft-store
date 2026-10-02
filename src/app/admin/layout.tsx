import Link from 'next/link'
import { requireAdminPage } from '@/lib/admin'

const navItems = [
  { href: '/admin', label: 'Catalog', help: 'Manage products, categories, and coupons' },
  { href: '/admin/shipping', label: 'Shipping', help: 'Configure shipment pickup details' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage()

  return (
    <div className="min-h-screen bg-[#f6f1e9] text-[#2b2b2b]">
      <header className="border-b border-[#d8c7b1] bg-[#fffaf3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a684b]">Art & craft studio</p>
            <h1 className="font-serif text-2xl text-[#4a5d3a]">Admin workspace</h1>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{session.user?.name || session.user?.email}</p>
            <Link href="/" className="text-[#a94e28] underline-offset-4 hover:underline">View shop</Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} title={item.help} className="block min-w-max rounded-xl border border-[#d8c7b1] bg-[#fffaf3] px-4 py-3 text-sm font-semibold text-[#4a5d3a] hover:border-[#a94e28]">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
