import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

import { getAdminApiSession } from '@/lib/admin'

export const maxDuration = 60; // Increase timeout

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET

/** Hard ceiling when uploading through the API route (Vercel body limit is ~4.5 MB). */
const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024

function cloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SECRET)
}

async function uploadToCloudinary(file: File): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'art-website/products'
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_SECRET}`

  // Generate SHA-1 signature
  const encoder = new TextEncoder()
  const data = encoder.encode(paramsToSign)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', CLOUDINARY_KEY!)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[upload] Cloudinary error:', response.status, errorBody)
    throw new Error(`Cloudinary upload failed (${response.status})`)
  }

  const result = (await response.json()) as { secure_url: string }
  return result.secure_url
}

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!(await getAdminApiSession()))
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (err) {
    // Most likely the request body exceeded Vercel's limit
    console.error('[upload] Failed to parse form data:', err)
    return NextResponse.json(
      { message: 'File too large — the server limit is ~4.5 MB. Use a smaller image or compress it first.' },
      { status: 413 },
    )
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: 'Choose an image file' }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ message: 'Only image files are allowed' }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return NextResponse.json(
      { message: `Image is ${sizeMB} MB — maximum allowed is 4.5 MB. Compress the image or use a smaller file.` },
      { status: 413 },
    )
  }

  if (cloudinaryConfigured()) {
    try {
      const url = await uploadToCloudinary(file)
      return NextResponse.json({ url, provider: 'cloudinary', name: file.name }, { status: 201 })
    } catch (error) {
      console.error('[upload] Cloudinary upload error:', error)
      return NextResponse.json(
        { message: error instanceof Error ? error.message : 'Upload to Cloudinary failed — please try again' },
        { status: 502 },
      )
    }
  }

  // Cloudinary not configured — return a deterministic placeholder without writing to disk.
  // This works on read-only filesystems (Vercel) and makes the mock status obvious.
  console.warn('[upload] Cloudinary is not configured — returning placeholder image URL')
  return NextResponse.json(
    {
      url: `https://placehold.co/800x800/e8dcc8/6f6255?text=${encodeURIComponent(file.name)}`,
      provider: 'mock',
      name: file.name,
      warning: 'Cloudinary is not configured — using a placeholder image. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for real uploads.',
    },
    { status: 201 },
  )
}
