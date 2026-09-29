import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shipping Policy | ArtCraft' }

export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full prose prose-charcoal">
      <h1 className="font-serif text-4xl text-charcoal mb-8">Shipping Policy</h1>
      
      <h3>Processing Time</h3>
      <p>All orders are processed within the product&apos;s specified processing time (typically 3-5 business days). Made-to-order or custom items may require additional time, which will be clearly stated on the product page.</p>
      
      <h3>Shipping Rates & Delivery Estimates</h3>
      <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
      <ul>
        <li><strong>Free Shipping:</strong> Available on all prepaid orders above ₹999.</li>
        <li><strong>Standard Shipping:</strong> For orders below ₹999, standard shipping rates apply based on the delivery pincode.</li>
        <li><strong>Cash on Delivery (COD):</strong> Available for orders up to ₹3000. A flat ₹50 COD convenience fee applies. Made-to-order items are not eligible for COD.</li>
      </ul>
      <p>Delivery delays can occasionally occur due to public holidays, extreme weather conditions, or carrier issues.</p>
      
      <h3>Shipment Confirmation & Order Tracking</h3>
      <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
    </div>
  )
}
