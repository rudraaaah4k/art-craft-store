'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@prisma/client'

export function ProductGallery({ images, title }: { images: ProductImage[], title: string }) {
  const [activeImage, setActiveImage] = useState(images[0]?.url || '/images/mock1.jpg')

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-sand/20 rounded overflow-hidden group">
        <Image 
          src={activeImage} 
          alt={title} 
          fill 
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-125 transition-transform duration-300 ease-out cursor-zoom-in" 
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img: ProductImage) => (
            <button 
              key={img.id} 
              type="button"
              aria-label={`View image ${images.indexOf(img) + 1} of ${images.length}`}
              aria-pressed={activeImage === img.url}
              onClick={() => setActiveImage(img.url)}
              className={`relative w-20 h-20 flex-shrink-0 border-2 overflow-hidden ${activeImage === img.url ? 'border-terracotta' : 'border-transparent'}`}
            >
              <Image 
                src={img.url} 
                alt={img.altText || ''} 
                fill 
                sizes="80px"
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
