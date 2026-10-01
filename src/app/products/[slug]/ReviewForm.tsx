'use client'

import { useState } from 'react'

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, rating, body }) })
    const data = await response.json()
    setMessage(response.ok ? 'Review submitted for moderation.' : data.error)
    if (response.ok) setBody('')
  }
  return <form onSubmit={submit} className="mt-8 border-t border-sand pt-6 max-w-xl"><h3 className="font-serif text-xl font-bold mb-3">Share your experience</h3><div className="flex gap-2 items-center mb-3"><label htmlFor="review-rating" className="text-sm">Rating</label><select id="review-rating" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="border border-sand p-2"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></div><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Your review" className="w-full border border-sand p-3 min-h-24" required /><button className="mt-3 bg-charcoal text-white px-5 py-3">Submit review</button>{message && <p className="mt-3 text-sm text-charcoal/70">{message}</p>}</form>
}