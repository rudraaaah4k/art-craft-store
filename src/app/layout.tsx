import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || 'https://artcraftstore.in'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ArtCraft Store — Handmade Indian Art & Craft',
    template: '%s | ArtCraft Store',
  },
  description: 'Discover unique handcrafted paintings, decor, and artisan goods from India. Premium quality, handmade with love. Free shipping above ₹999.',
  keywords: ['handmade art', 'Indian craft', 'paintings', 'handcrafted decor', 'artisan goods', 'buy art online India'],
  authors: [{ name: 'ArtCraft Store' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'ArtCraft Store',
    title: 'ArtCraft Store — Handmade Indian Art & Craft',
    description: 'Discover unique handcrafted paintings, decor, and artisan goods from India. Premium quality, handmade with love.',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'ArtCraft Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtCraft Store — Handmade Indian Art & Craft',
    description: 'Discover unique handcrafted paintings, decor, and artisan goods from India.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-cream text-charcoal selection:bg-terracotta selection:text-white">
        <AuthProvider>
          <Header />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
