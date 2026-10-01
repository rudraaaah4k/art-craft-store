'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const loadCartCount = async () => {
      const response = await fetch('/api/cart', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count ?? 0)
      }
    }
    void loadCartCount()
    window.addEventListener('cart-updated', loadCartCount)
    return () => window.removeEventListener('cart-updated', loadCartCount)
  }, [session?.user?.id])

  return (
    <header className="bg-cream border-b border-sand sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-serif text-2xl font-bold text-terracotta">
              ArtCraft
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-charcoal hover:text-terracotta transition-colors">Home</Link>
            <Link href="/shop" className="text-charcoal hover:text-terracotta transition-colors">Shop</Link>
            <Link href="/about" className="text-charcoal hover:text-terracotta transition-colors">About</Link>
            <Link href="/contact" className="text-charcoal hover:text-terracotta transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <form action="/shop" className="relative">
              <input 
                type="text" 
                name="q" 
                placeholder="Search..." 
                className="pl-3 pr-10 py-1 border border-sand bg-white text-sm focus:outline-none focus:border-terracotta rounded-full text-charcoal"
              />
              <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-terracotta">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>

            <Link href="/cart" aria-label="Shopping Cart" className="text-charcoal hover:text-terracotta relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-deep-olive text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {session ? (
              <div className="relative group">
                <button aria-label="User Account" className="text-charcoal hover:text-terracotta flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block min-w-[150px]">
                  <div className="bg-white border border-sand shadow-lg rounded p-2 flex flex-col gap-1 text-sm">
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" className="px-3 py-2 hover:bg-cream hover:text-terracotta rounded">Admin Dashboard</Link>
                    )}
                    <Link href="/account/wishlist" className="px-3 py-2 hover:bg-cream hover:text-terracotta rounded">Wishlist</Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="px-3 py-2 text-left hover:bg-cream hover:text-terracotta rounded w-full">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="text-charcoal hover:text-terracotta text-sm font-medium">Log In</Link>
            )}
          </div>
          
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" aria-label="Shopping Cart" className="text-charcoal relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-deep-olive text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button aria-label="Toggle mobile menu" onClick={() => setMenuOpen(!menuOpen)} className="text-charcoal">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {menuOpen && (
        <div className="md:hidden border-t border-sand bg-cream">
          <nav className="flex flex-col p-4 space-y-4">
            <form action="/shop" className="relative">
              <input type="text" name="q" placeholder="Search..." className="w-full pl-3 pr-10 py-2 border border-sand bg-white text-sm focus:outline-none focus:border-terracotta rounded text-charcoal" />
            </form>
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-charcoal font-medium">Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-charcoal font-medium">Shop</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-charcoal font-medium">About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-charcoal font-medium">Contact</Link>
            {session ? (
              <>
                <Link href="/account/wishlist" onClick={() => setMenuOpen(false)} className="text-charcoal font-medium">Wishlist</Link>
                {session.user.role === 'ADMIN' && <Link href="/admin" className="text-terracotta font-medium">Admin</Link>}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left text-charcoal font-medium">Logout</button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-charcoal font-medium">Log In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
