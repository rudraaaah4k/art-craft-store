import { Metadata } from 'next'
import { Reveal } from '@/lib/motion'

export const metadata: Metadata = { title: 'Privacy Policy | ArtCraft' }

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <Reveal>
        <div className="mb-10 pb-6 border-b border-sand">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold block mb-2">
            Data Protection
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            At ArtCraft, we are committed to upholding your privacy and ensuring transparency in how customer data is processed.
          </p>
        </div>
      </Reveal>

      <div className="space-y-8">
        <Reveal delay={0.1}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Information We Collect</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              We collect details required to securely fulfill and ship your orders: name, billing/shipping address, email address, telephone contact, and delivery instructions. Payment information (such as card numbers or UPI tokens) is handled exclusively by RBI-compliant payment gateways (Razorpay) via encrypted channels and is never stored on our servers.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">How Information Is Utilized</h2>
            <ul className="space-y-2 text-sm sm:text-base text-charcoal/80 list-disc pl-5 leading-relaxed">
              <li>Generating GST invoices and processing transaction verification.</li>
              <li>Handing over delivery data to courier aggregators (Shiprocket) for route fulfillment and OTP delivery verification.</li>
              <li>Providing transaction notifications and shipment tracking updates.</li>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white/80 p-6 sm:p-8 rounded-xl border border-sand shadow-sm space-y-3">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Data Integrity & Privacy Questions</h2>
            <p className="text-charcoal/80 leading-relaxed text-sm sm:text-base">
              We never sell, rent, or trade patron contact lists to external advertisers. For questions or account data deletion requests, contact our privacy officer at <a href="mailto:privacy@artcraft.com" className="text-terracotta underline font-semibold">privacy@artcraft.com</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
