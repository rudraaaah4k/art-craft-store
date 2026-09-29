import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy | ArtCraft' }

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full prose prose-charcoal">
      <h1 className="font-serif text-4xl text-charcoal mb-8">Privacy Policy</h1>
      
      <p>At ArtCraft, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
      
      <h3>Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact customer support. This includes your name, email, shipping address, phone number, and payment details (processed securely via our payment gateway).</p>
      
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To process and fulfill your orders, including sending emails to confirm your order status and shipment.</li>
        <li>To communicate with you about products, services, offers, and promotions.</li>
        <li>To monitor and analyze trends, usage, and activities in connection with our website.</li>
      </ul>
      
      <h3>Information Sharing</h3>
      <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except trusted third parties who assist us in operating our website (e.g., shipping partners like Shiprocket) or processing payments (e.g., Razorpay), as long as those parties agree to keep this information confidential.</p>
      
      <h3>Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at support@artcraft.com.</p>
    </div>
  )
}
