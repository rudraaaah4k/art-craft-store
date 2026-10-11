import { Metadata } from 'next'
import { Reveal } from '@/lib/motion'

export const metadata: Metadata = { title: 'Terms of Service | ArtCraft' }

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <Reveal>
        <div className="mb-10 pb-6 border-b border-sand">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold block mb-2">
            Legal Terms
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-bold tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            Please read these terms carefully before exploring or placing orders on ArtCraft Store.
          </p>
        </div>
      </Reveal>

      <div className="space-y-8">
        <Reveal delay={0.1}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">1. Products & Transparent Pricing</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              All prices displayed across ArtCraft are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST). Item listings include detailed dimensions, materials, and artisan technique notes. Due to the handmade nature of traditional craftsmanship, slight natural variances in brushstroke texture and pigment shade are authentic characteristics of original work.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">2. Orders & Stock Reservations</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              Upon proceeding to checkout, inventory is temporarily reserved for 15 minutes to prevent overselling. If payment is uncompleted within this window, the stock reservation expires automatically and returns to inventory.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">3. Intellectual Property</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              All photography, descriptions, artist biographies, and bespoke designs published on this site are intellectual assets of ArtCraft and our respective artisan partners. Unauthorized commercial reproduction or automated scraping is prohibited.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
