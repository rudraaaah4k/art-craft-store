import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Return Policy | ArtCraft' }

export default function ReturnPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full prose prose-charcoal">
      <h1 className="font-serif text-4xl text-charcoal mb-8">Return & Refund Policy</h1>
      
      <h3>7-Day Return Window</h3>
      <p>We accept returns for eligible items within 7 days of the delivery date. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.</p>
      
      <h3>Exceptions / Non-Returnable Items</h3>
      <p>Certain types of items cannot be returned:</p>
      <ul>
        <li><strong>Custom / Made-to-Order Items:</strong> Since these are specially crafted for you, they are non-returnable and non-refundable.</li>
        <li><strong>Digital Art/Downloads:</strong> Digital products are non-refundable once the download link has been provided.</li>
        <li><strong>Items on Sale:</strong> Clearance items cannot be refunded.</li>
      </ul>

      <h3>Refunds</h3>
      <p>Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed to your original method of payment within 5-7 business days.</p>
      
      <h3>Damaged Items</h3>
      <p>If you receive an item that is damaged or defective, please contact us immediately (within 48 hours of delivery) with photographic evidence so we can evaluate the issue and make it right.</p>
    </div>
  )
}
