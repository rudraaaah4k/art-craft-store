import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WishlistClient } from './WishlistClient'

export const metadata = {
  title: 'My Wishlist | ArtCraft',
}

export default async function WishlistPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/account/wishlist')
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        where: { status: 'PUBLISHED', deletedAt: null },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } }
      }
    }
  })

  const products = wishlist?.products ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-8">My Wishlist</h1>
      
      {products.length === 0 ? (
        <div className="bg-sand/10 border border-sand p-16 text-center rounded flex flex-col items-center justify-center min-h-[40vh]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-charcoal/30 mb-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h2 className="text-2xl font-serif text-charcoal mb-4">Your wishlist is empty</h2>
          <p className="text-charcoal/70 mb-8 max-w-md mx-auto">Discover beautiful handmade art and crafts to add to your collection.</p>
          <Link href="/shop" className="inline-block bg-terracotta text-white px-8 py-3 font-medium hover:bg-charcoal transition-colors rounded">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <WishlistClient key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
