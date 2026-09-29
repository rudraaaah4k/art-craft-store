import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | ArtCraft' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full prose prose-charcoal">
      <h1 className="font-serif text-4xl text-charcoal mb-8">Terms of Service</h1>
      
      <p>Welcome to ArtCraft. By accessing our website and purchasing our products, you agree to be bound by these Terms of Service.</p>
      
      <h3>1. Products and Pricing</h3>
      <p>All prices are in Indian Rupees (INR) and are inclusive of GST. We reserve the right to modify prices without prior notice. We make every effort to display as accurately as possible the colors and images of our products.</p>
      
      <h3>2. Orders and Payment</h3>
      <p>By placing an order, you warrant that you are legally capable of entering into binding contracts. We accept prepaid methods (credit/debit cards, UPI, net banking) and Cash on Delivery for eligible orders up to ₹3000.</p>
      
      <h3>3. Intellectual Property</h3>
      <p>The content on this website, including digital art, designs, images, and text, is the property of ArtCraft or its artisans. It may not be reproduced without explicit permission.</p>
      
      <h3>4. Changes to Terms</h3>
      <p>We reserve the right to update or change these Terms of Service at any time. Your continued use of the website following any changes constitutes acceptance of those changes.</p>
    </div>
  )
}
