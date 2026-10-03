import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || 'https://artcraftstore.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/', '/account/', '/checkout/', '/cart/', '/orders/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
