import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-charcoal text-sand py-16 border-t border-sand/20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-cream tracking-tight">ArtCraft</h3>
            <p className="text-sm opacity-80 leading-relaxed max-w-sm">
              Curated handmade art, paintings, and traditional crafts from skilled artisans across India. 
              Authentic heritage, fair trade, and lovingly delivered to your home.
            </p>
            <div className="pt-2 text-xs text-sand/60">
              Preserving Indian art forms, one masterpiece at a time.
            </div>
          </div>

          {/* Shop Links with depth hover */}
          <div>
            <h4 className="font-bold text-cream mb-4 uppercase tracking-wider text-xs">Shop Collection</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'All Products', href: '/shop' },
                { name: 'Paintings & Canvas', href: '/shop?category=paintings' },
                { name: 'Handicrafts & Decor', href: '/shop?category=handicrafts' },
                { name: 'Digital & Print Art', href: '/shop?category=digital-art' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="inline-block text-sand/80 hover:text-terracotta hover:translate-x-1.5 transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Policies with depth hover */}
          <div>
            <h4 className="font-bold text-cream mb-4 uppercase tracking-wider text-xs">Customer Care</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Contact Us', href: '/contact' },
                { name: 'Shipping Policy', href: '/shipping-policy' },
                { name: 'Return & Refund Policy', href: '/return-policy' },
                { name: 'About Our Artisans', href: '/about' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="inline-block text-sand/80 hover:text-terracotta hover:translate-x-1.5 transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 className="font-bold text-cream mb-4 uppercase tracking-wider text-xs">Legal & Security</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms of Service', href: '/terms' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="inline-block text-sand/80 hover:text-terracotta hover:translate-x-1.5 transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-sand/70">
              <span className="block font-semibold text-cream mb-1">100% Secure Checkout</span>
              Encrypted Razorpay payments & verified Shiprocket delivery tracking.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sand/20 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60">
          <p>&copy; {new Date().getFullYear()} ArtCraft Store. All rights reserved. GST-inclusive prices.</p>
          <p>Handmade with pride in India</p>
        </div>
      </div>
    </footer>
  )
}
