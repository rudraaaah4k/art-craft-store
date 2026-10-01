import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | ArtCraft',
  description: 'Get in touch with ArtCraft for custom artwork, order inquiries, or any questions about our handmade Indian art and craft store.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
