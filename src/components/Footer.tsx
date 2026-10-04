import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-charcoal text-sand py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-2xl text-cream mb-4">ArtCraft</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Curated handmade art, crafts, and digital prints from skilled artisans across India. 
              Authentic, premium, and lovingly crafted.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-cream mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/shop" className="hover:text-terracotta transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=paintings" className="hover:text-terracotta transition-colors">Paintings</Link></li>
              <li><Link href="/shop?category=handicrafts" className="hover:text-terracotta transition-colors">Handicrafts</Link></li>
              <li><Link href="/shop?category=digital-art" className="hover:text-terracotta transition-colors">Digital Art</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cream mb-4 uppercase tracking-wider text-sm">Help</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/contact" className="hover:text-terracotta transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-terracotta transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-terracotta transition-colors">Return & Refund</Link></li>
              <li><Link href="/about" className="hover:text-terracotta transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cream mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/privacy-policy" className="hover:text-terracotta transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-terracotta transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-sand/20 mt-12 pt-8 text-center text-sm opacity-60">
          <p>&copy; {new Date().getFullYear()} ArtCraft Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
