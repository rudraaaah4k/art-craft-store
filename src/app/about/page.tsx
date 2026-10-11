import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal, Parallax } from '@/lib/motion'

export const metadata: Metadata = {
  title: 'About Our Master Artisans & Story | ArtCraft',
  description:
    'Learn about ArtCraft’s mission: empowering Indian folk artisans, reviving ancestral craft traditions, and delivering authentic handmade art to patrons worldwide.',
}

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      {/* Hero Header with Reveal */}
      <Reveal>
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold block mb-2">
            Heritage & Craftsmanship
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-charcoal mb-5 tracking-tight">
            Preserving Centuries of Indian Art
          </h1>
          <p className="text-lg sm:text-xl text-charcoal/80 font-sans leading-relaxed">
            ArtCraft bridges the sanctum between ancestral village ateliers and modern collectors,
            empowering master artisans and celebrating living culture.
          </p>
        </div>
      </Reveal>

      {/* Story Section with Parallax Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 sm:mb-28">
        <Parallax speed={0.4}>
          <div className="relative h-[380px] sm:h-[480px] w-full bg-sand/30 rounded-2xl overflow-hidden border border-sand/80 shadow-lg">
            <Image
              src="/images/mock2.jpg"
              alt="Indian artisan crafting authentic handmade artwork"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-cream font-serif text-lg font-bold">
              Artisan Atelier · Rajasthan
            </div>
          </div>
        </Parallax>

        <Reveal delay={0.15}>
          <div className="prose prose-charcoal max-w-none space-y-5 text-charcoal/85 leading-relaxed text-base sm:text-lg">
            <h2 className="font-serif text-3xl text-charcoal mb-4 font-bold">
              Our Journey & Ethos
            </h2>
            <p>
              Founded with an uncompromising passion for authentic Indian folk and traditional arts,
              ArtCraft connects skilled rural masters directly with art patrons across India and
              abroad. We curate hand-painted Pichwai canvases, intricate Madhubani scrolls, terracotta
              sculptures, and contemporary digital tributes.
            </p>
            <p>
              Every artwork in our collection is crafted with natural organic pigments, hand-loomed
              canvases, and ancestral techniques passed down across generations. When you acquire a
              piece from ArtCraft, you are not simply decorating a wall—you are upholding a livelihood
              and keeping Indian artisanal heritage alive.
            </p>
            <div className="pt-4 flex gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-charcoal transition-colors shadow-sm"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Values & Stats Cards with Depth Hover */}
      <Reveal delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {[
            {
              title: '100% Fair Trade',
              desc: 'Direct ethical compensation for every artisan atelier without predatory middlemen.',
              badge: 'Artisan First',
            },
            {
              title: 'Ancestral Quality',
              desc: 'Natural mineral dyes, seasoned teak framing, and archival museum-grade finishes.',
              badge: 'Heritage Grade',
            },
            {
              title: 'Pan-India Reach',
              desc: 'Insured zero-breakage packaging and express nationwide courier dispatch.',
              badge: 'Safe Delivery',
            },
          ].map((val, idx) => (
            <div
              key={idx}
              className="bg-white/80 border border-sand rounded-xl p-8 shadow-sm hover:shadow-md hover:border-terracotta/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-deep-olive bg-deep-olive/10 px-2.5 py-1 rounded-full inline-block mb-4">
                  {val.badge}
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal mb-3">{val.title}</h3>
                <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
