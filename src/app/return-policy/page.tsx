import { Metadata } from 'next'
import { Reveal } from '@/lib/motion'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Return & Refund Policy | ArtCraft' }

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <Reveal>
        <div className="mb-10 pb-6 border-b border-sand">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold block mb-2">
            Transparency & Trust
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-bold tracking-tight mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            We take utmost care in packaging and crafting every piece. Read our policy regarding returns, exchanges, and custom creations below.
          </p>
        </div>
      </Reveal>

      <div className="space-y-8">
        <Reveal delay={0.1}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">7-Day Return Window</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              We gladly accept returns for standard, non-custom catalog artworks within <strong>7 days</strong> of delivery. To remain eligible, the item must be undamaged, unmounted, in its original artisan packaging, and with all authenticity certificates intact.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Custom & Made-to-Order Exemptions</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              Because made-to-order and bespoke commission pieces are personalized according to individual dimensions, colours, and requests, they are <strong>strictly non-returnable and non-refundable</strong> unless transit damage is verified upon delivery.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Damaged in Transit Process</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              Every package is insured. In the rare event an item arrives damaged, please photograph the external box and the affected item within 48 hours of delivery and email us at <a href="mailto:support@artcraft.com" className="text-terracotta underline font-semibold">support@artcraft.com</a>. We will dispatch an immediate replacement or process a full refund.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="bg-sand/20 p-6 rounded-xl border border-sand flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">Need assistance with a return?</h3>
              <p className="text-xs sm:text-sm text-charcoal/70">Our customer support team is here to help.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-charcoal text-white rounded-lg text-sm font-semibold hover:bg-terracotta transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
