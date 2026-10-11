'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { MagneticButton, useReducedMotion, MOTION_TOKENS } from '@/lib/motion'

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [badgeBouncing, setBadgeBouncing] = useState(false)
  const prevCount = useRef(0)
  const reducedMotion = useReducedMotion()

  // Track window scroll for glass blur and shrinking height
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track cart count and trigger bounce on update
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const response = await fetch('/api/cart', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          const count = data.count ?? 0
          setCartCount(count)
          if (count !== prevCount.current && count > 0) {
            setBadgeBouncing(true)
            setTimeout(() => setBadgeBouncing(false), 600)
          }
          prevCount.current = count
        }
      } catch {
        // ignore load errors
      }
    }
    void loadCartCount()
    window.addEventListener('cart-updated', loadCartCount)
    return () => window.removeEventListener('cart-updated', loadCartCount)
  }, [session?.user?.id])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-terracotta focus:text-white focus:px-4 focus:py-2 focus:rounded shadow-lg"
      >
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-out border-b ${
          scrolled
            ? 'bg-cream/90 backdrop-blur-md shadow-sm border-sand/80 h-16'
            : 'bg-cream border-sand h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="font-serif text-2xl sm:text-3xl font-bold text-terracotta tracking-tight hover:opacity-90 transition-opacity"
              >
                ArtCraft
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', href: '/' },
                { name: 'Shop', href: '/shop' },
                { name: 'About', href: '/about' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-charcoal hover:text-terracotta transition-colors text-sm font-medium tracking-wide relative py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-terracotta transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Search Form */}
              <form action="/shop" className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="Search art & crafts..."
                  aria-label="Search products"
                  className="pl-3.5 pr-10 py-1.5 border border-sand bg-white/90 text-sm focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 rounded-full text-charcoal w-44 focus:w-60 transition-all duration-300 placeholder:text-charcoal/40"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-terracotta transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </form>

              {/* Magnetic Shopping Cart */}
              <MagneticButton>
                <Link
                  href="/cart"
                  aria-label="Shopping Cart"
                  className="text-charcoal hover:text-terracotta relative p-2 block transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <span
                    aria-live="polite"
                    aria-label={`${cartCount} items in cart`}
                    className={`absolute top-0 right-0 bg-deep-olive text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      badgeBouncing && !reducedMotion ? 'scale-125 bg-terracotta' : 'scale-100'
                    }`}
                  >
                    {cartCount}
                  </span>
                </Link>
              </MagneticButton>

              {/* User Account / Login */}
              {session ? (
                <div className="relative group">
                  <button
                    aria-label="User Account"
                    className="text-charcoal hover:text-terracotta flex items-center gap-1 p-2 transition-colors rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </button>
                  <div
                    role="menu"
                    className="absolute right-0 top-full pt-2 hidden group-hover:block min-w-[170px]"
                  >
                    <div className="bg-white border border-sand shadow-xl rounded-lg p-2 flex flex-col gap-1 text-sm animate-in fade-in slide-in-from-top-1 duration-150">
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="px-3 py-2 hover:bg-cream hover:text-terracotta rounded font-medium"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account/wishlist"
                        className="px-3 py-2 hover:bg-cream hover:text-terracotta rounded"
                      >
                        Wishlist
                      </Link>
                      <Link
                        href="/account/orders"
                        className="px-3 py-2 hover:bg-cream hover:text-terracotta rounded"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="px-3 py-2 hover:bg-cream hover:text-terracotta rounded"
                      >
                        Addresses
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="px-3 py-2 text-left hover:bg-cream hover:text-terracotta rounded w-full border-t border-sand/40 mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-charcoal hover:text-terracotta text-sm font-medium px-4 py-2 rounded-full border border-sand hover:border-terracotta transition-colors min-h-[44px] flex items-center"
                >
                  Log In
                </Link>
              )}
            </div>

            {/* Mobile Actions: Cart & Hamburger */}
            <div className="md:hidden flex items-center space-x-3">
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="text-charcoal relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span
                    className={`absolute top-1 right-1 bg-deep-olive text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transition-transform ${
                      badgeBouncing && !reducedMotion ? 'scale-125 bg-terracotta' : 'scale-100'
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                aria-label={menuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-charcoal p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Animated Mobile Menu Drawer (Staggered Links & Depth Slide) */}
        <AnimatePresence>
          {menuOpen && (
            <m.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: MOTION_TOKENS.ease.out }}
              className="md:hidden border-t border-sand bg-cream/95 backdrop-blur-lg overflow-hidden shadow-2xl"
            >
              <nav aria-label="Mobile navigation" className="flex flex-col p-5 space-y-4">
                <form action="/shop" className="relative mb-2">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search art & craft..."
                    aria-label="Search products"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-sand bg-white text-sm focus:outline-none focus:border-terracotta rounded-lg text-charcoal"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </button>
                </form>

                <div className="flex flex-col space-y-3 pt-2">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="text-charcoal font-medium text-lg py-1 hover:text-terracotta transition-colors min-h-[44px] flex items-center"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="text-charcoal font-medium text-lg py-1 hover:text-terracotta transition-colors min-h-[44px] flex items-center"
                  >
                    Shop Collection
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                    className="text-charcoal font-medium text-lg py-1 hover:text-terracotta transition-colors min-h-[44px] flex items-center"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="text-charcoal font-medium text-lg py-1 hover:text-terracotta transition-colors min-h-[44px] flex items-center"
                  >
                    Contact
                  </Link>
                </div>

                <div className="pt-4 border-t border-sand/60 flex flex-col space-y-2">
                  {session ? (
                    <>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="text-charcoal font-medium py-1 min-h-[44px] flex items-center"
                      >
                        Wishlist
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setMenuOpen(false)}
                        className="text-charcoal font-medium py-1 min-h-[44px] flex items-center"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setMenuOpen(false)}
                        className="text-charcoal font-medium py-1 min-h-[44px] flex items-center"
                      >
                        Addresses
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="text-terracotta font-medium py-1 min-h-[44px] flex items-center"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-left text-charcoal font-medium py-1 min-h-[44px] flex items-center text-red-600"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-terracotta font-medium py-2 min-h-[44px] flex items-center text-lg"
                    >
                      Log In / Register
                    </Link>
                  )}
                </div>
              </nav>
            </m.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
