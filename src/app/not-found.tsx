import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-sand/10 min-h-[60vh]">
      <h1 className="text-6xl font-serif font-bold text-terracotta mb-4">404</h1>
      <h2 className="text-2xl font-medium text-charcoal mb-6">Page Not Found</h2>
      <p className="text-charcoal/70 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/" className="bg-charcoal text-white px-8 py-3 font-medium hover:bg-deep-olive transition-colors">
        Return Home
      </Link>
    </div>
  )
}
