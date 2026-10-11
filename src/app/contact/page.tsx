'use client'

import { FormEvent, useState } from 'react'
import { Reveal } from '@/lib/motion'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Mock submission
    setTimeout(() => setSubmitted(true), 400)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <Reveal>
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold block mb-2">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-charcoal mb-4 tracking-tight">
            Contact Our Atelier
          </h1>
          <p className="text-lg text-charcoal/70">
            Have a question regarding custom orders, shipping times, or artwork preservation? We would love to assist you.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 max-w-5xl mx-auto">
        {/* Contact Form Card */}
        <Reveal delay={0.1}>
          <div className="bg-white/80 p-8 sm:p-10 rounded-2xl border border-sand shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="bg-deep-olive/10 text-deep-olive p-8 rounded-xl border border-deep-olive/30 text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-deep-olive text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-serif text-lg font-bold mb-1">Message Received</h3>
                <p className="text-sm">
                  Thank you for reaching out! Our artisan coordinator will respond to your inquiry within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-1.5 text-charcoal">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    className="w-full p-3 border border-sand rounded-lg bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none text-charcoal transition-all text-sm"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-charcoal">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    className="w-full p-3 border border-sand rounded-lg bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none text-charcoal transition-all text-sm"
                    placeholder="priya@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold mb-1.5 text-charcoal">
                    Subject
                  </label>
                  <input
                    required
                    type="text"
                    id="subject"
                    className="w-full p-3 border border-sand rounded-lg bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none text-charcoal transition-all text-sm"
                    placeholder="Inquiry or Custom Artwork"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-1.5 text-charcoal">
                    Message
                  </label>
                  <textarea
                    required
                    id="message"
                    rows={5}
                    className="w-full p-3 border border-sand rounded-lg bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none text-charcoal transition-all text-sm"
                    placeholder="Tell us what you are looking for..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-terracotta text-white font-semibold py-3.5 rounded-lg hover:bg-charcoal transition-colors shadow-sm min-h-[48px] text-sm active:scale-[0.98]"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* Studio Info Details */}
        <Reveal delay={0.2}>
          <div className="space-y-8 flex flex-col justify-center">
            <div className="bg-sand/20 p-6 rounded-xl border border-sand/70">
              <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Our Artisan Studio</h3>
              <p className="text-charcoal/80 text-sm leading-relaxed">
                123 Artisan Heritage Valley, MI Road<br />
                Jaipur, Rajasthan 302001<br />
                India
              </p>
            </div>

            <div className="bg-sand/20 p-6 rounded-xl border border-sand/70">
              <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Direct Inquiries</h3>
              <p className="text-charcoal/80 text-sm mb-1">
                <strong>Email:</strong> support@artcraft.com
              </p>
              <p className="text-charcoal/80 text-sm mb-2">
                <strong>Phone / WhatsApp:</strong> +91 98765 43210
              </p>
              <p className="text-charcoal/60 text-xs">
                Artisan atelier support hours: Monday – Saturday, 10:00 AM – 6:00 PM IST
              </p>
            </div>

            <div className="bg-deep-olive/10 border border-deep-olive/20 p-6 rounded-xl">
              <h4 className="font-serif font-bold text-deep-olive mb-1">Custom Made-to-Order?</h4>
              <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
                Looking for specific dimensions, auspicious motifs, or bespoke family portraiture? Send us your reference and dimensions directly for a tailored quote.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
