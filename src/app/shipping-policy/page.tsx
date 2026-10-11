import { Metadata } from 'next'
import { Reveal } from '@/lib/motion'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Shipping Policy | ArtCraft' }

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <Reveal>
        <div className="mb-10 pb-6 border-b border-sand">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold block mb-2">
            Pan-India Logistics
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-bold tracking-tight mb-4">
            Shipping & Delivery Policy
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            We partner with Shiprocket to aggregate Bluedart, Delhivery, Amazon Shipping, and DTDC for safe, insured, and prompt transit.
          </p>
        </div>
      </Reveal>

      <div className="space-y-8">
        <Reveal delay={0.1}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Processing & Crafting Timeline</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              Because many artworks are individually finalized, framed, and inspected by hand, orders carry a processing window of <strong>3 to 5 business days</strong> prior to dispatch. Bespoke or made-to-order creations indicate extended crafting windows on their respective product pages.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Shipping Rates & Thresholds</h2>
            <ul className="space-y-2 text-sm sm:text-base text-charcoal/80 list-disc pl-5 leading-relaxed">
              <li>
                <strong>Free Shipping:</strong> Automatically granted on all prepaid cart orders above <strong>₹999</strong>.
              </li>
              <li>
                <strong>Standard Shipping:</strong> For orders under ₹999, live carrier rates calculated by weight and delivery pincode apply.
              </li>
              <li>
                <strong>Cash on Delivery (COD):</strong> Permitted up to <strong>₹3000</strong> with a standard flat <strong>₹50</strong> COD handling fee. Made-to-order artworks require prepayment.
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Real-Time Tracking & Notifications</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              Once handed over to the courier partner, an automated dispatch notification with your AWB tracking link is issued via email. You can monitor the package journey in real time on our <Link href="/tracking" className="text-terracotta underline font-semibold">Tracking Portal</Link>.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
