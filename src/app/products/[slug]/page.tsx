import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductGallery } from './ProductGallery'
import { ProductActions } from './ProductActions'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!product || product.status === 'DRAFT') return { title: 'Product Not Found' }
  return {
    title: product.metaTitle || product.title,
    description: product.metaDescription || product.description,
  }
}

export default async function ProductPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { name: true } } } }
    }
  })

  if (!product || product.status === 'DRAFT') {
    notFound()
  }

  // Find related products
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'PUBLISHED'
    },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    take: 4,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumbs */}
      <div className="text-sm text-charcoal/60 mb-8 flex gap-2">
        <Link href="/" className="hover:text-terracotta">Home</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-terracotta">{product.category.name}</Link>
        <span>/</span>
        <span className="text-charcoal truncate">{product.title}</span>
      </div>

      {/* Main Product Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductGallery images={product.images} title={product.title} />
        
        <div className="flex flex-col">
          <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">{product.title}</h1>
          
          {product.isMadeToOrder && (
            <div className="mb-4 inline-flex">
              <span className="bg-deep-olive text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Made to Order</span>
            </div>
          )}

          <ProductActions product={product} />
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-16 border-t border-sand pt-12">
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Product Details</h2>
        <div className="prose prose-sm sm:prose text-charcoal/80 max-w-none">
          {product.description.split('\n').map((para, idx) => (
            <p key={idx} className="mb-4">{para}</p>
          ))}
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-charcoal/70 bg-sand/10 p-6 rounded">
          {product.lengthCm && product.widthCm && product.heightCm && (
            <div><strong>Dimensions:</strong> {product.lengthCm} x {product.widthCm} x {product.heightCm} cm</div>
          )}
          <div><strong>Weight:</strong> {product.weightGrams} g</div>
          <div><strong>Processing Time:</strong> Ships in {product.processingDays} days</div>
          <div><strong>COD:</strong> {product.codAllowed ? 'Available (up to ₹3000)' : 'Not available for this item'}</div>
        </div>
      </div>

      {/* Reviews (Read Only) */}
      <div className="mt-16 border-t border-sand pt-12">
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="text-charcoal/60">No reviews yet for this product.</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map(review => (
              <div key={review.id} className="border-b border-sand/50 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-terracotta text-lg">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="font-bold text-charcoal">{review.user.name || 'Anonymous'}</span>
                  <span className="text-sm text-charcoal/50 ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.body && <p className="text-charcoal/80 text-sm mt-2">{review.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-sand pt-12">
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <Link key={prod.id} href={`/products/${prod.slug}`} className="group flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden bg-sand/30">
                  <Image 
                    src={prod.images?.[0]?.url || '/images/mock1.jpg'} 
                    alt={prod.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div>
                  <h3 className="font-medium text-charcoal truncate">{prod.title}</h3>
                  <div className="font-bold text-charcoal">₹{((prod.salePrice || prod.price) / 100).toLocaleString('en-IN')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
