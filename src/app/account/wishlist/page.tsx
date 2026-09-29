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
        <div className="bg-sand/10 p-12 text-center rounded border border-sand">
          <h2 className="text-xl font-serif text-charcoal mb-4">Your wishlist is empty</h2>
          <p className="text-charcoal/70 mb-6">Discover beautiful handmade art and crafts to add to your collection.</p>
          <Link href="/shop" className="bg-terracotta text-white px-6 py-3 font-medium hover:bg-terracotta/90 transition-colors inline-block">
            Start Shopping
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
