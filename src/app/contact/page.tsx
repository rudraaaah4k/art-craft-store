'use client'

import { FormEvent, useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Mock submission
    setTimeout(() => setSubmitted(true), 500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">Contact Us</h1>
        <p className="text-charcoal/70">Have a question about an order, custom artwork, or our policies? We&apos;d love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="bg-sand/20 p-8 rounded border border-sand">
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Send a Message</h2>
          
          {submitted ? (
            <div className="bg-deep-olive/10 text-deep-olive p-6 rounded border border-deep-olive text-center">
              <p className="font-medium mb-2">Thank you for reaching out!</p>
              <p className="text-sm">We have received your message and will get back to you within 24-48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-charcoal">Name</label>
                <input required type="text" id="name" className="w-full p-2 border border-sand rounded bg-white focus:border-terracotta focus:outline-none" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-charcoal">Email</label>
                <input required type="email" id="email" className="w-full p-2 border border-sand rounded bg-white focus:border-terracotta focus:outline-none" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1 text-charcoal">Subject</label>
                <input required type="text" id="subject" className="w-full p-2 border border-sand rounded bg-white focus:border-terracotta focus:outline-none" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1 text-charcoal">Message</label>
                <textarea required id="message" rows={5} className="w-full p-2 border border-sand rounded bg-white focus:border-terracotta focus:outline-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-terracotta text-white font-medium py-3 rounded hover:bg-terracotta/90 transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-serif font-bold text-charcoal mb-3">Our Studio</h3>
            <p className="text-charcoal/80 mb-1">123 Artisan Valley</p>
            <p className="text-charcoal/80 mb-1">Jaipur, Rajasthan 302001</p>
            <p className="text-charcoal/80">India</p>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-charcoal mb-3">Contact Info</h3>
            <p className="text-charcoal/80 mb-1"><strong>Email:</strong> support@artcraft.com</p>
            <p className="text-charcoal/80 mb-1"><strong>Phone:</strong> +91 98765 43210</p>
            <p className="text-charcoal/80 mt-2 text-sm">Customer support hours: Mon-Fri, 10 AM to 6 PM IST</p>
          </div>
        </div>
      </div>
    </div>
  )
}
