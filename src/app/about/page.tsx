import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = { title: 'About Us | ArtCraft' }

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 w-full">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">About ArtCraft</h1>
        <p className="text-lg text-charcoal/80">Empowering artisans and bringing authentic Indian craftsmanship to the world.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative h-[400px] w-full bg-sand/30 rounded overflow-hidden">
          <Image src="/images/mock2.jpg" alt="Artisan working" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="prose prose-charcoal">
          <h2 className="font-serif text-2xl mb-4">Our Story</h2>
          <p>Founded with a passion for preserving traditional Indian arts, ArtCraft bridges the gap between skilled rural artisans and art lovers globally. We curate hand-painted canvases, intricately carved decor, and modern digital illustrations that celebrate our rich cultural heritage.</p>
          <p>Every piece in our collection is carefully selected for its quality, authenticity, and the story it tells. When you buy from ArtCraft, you are not just buying a product; you are supporting a livelihood and keeping a centuries-old tradition alive.</p>
        </div>
      </div>
    </div>
  )
}
