import { enforceRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getAdminApiSession } from '@/lib/admin'

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET

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
    const error = await response.text()
    throw new Error(`Cloudinary upload failed: ${error}`)
  }

  const result = (await response.json()) as { secure_url: string }
  return result.secure_url
}

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
  if (!(await getAdminApiSession()))
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: 'Choose an image file' }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ message: 'Only image files are allowed' }, { status: 400 })
  }

  // Validate file size (max 10 MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ message: 'Image must be smaller than 10 MB' }, { status: 400 })
  }

  if (cloudinaryConfigured()) {
    try {
      const url = await uploadToCloudinary(file)
      return NextResponse.json({ url, provider: 'cloudinary', name: file.name }, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : 'Upload failed' },
        { status: 500 },
      )
    }
  }

  // Mock upload: return a placeholder URL
  return NextResponse.json(
    {
      url: `/uploads/mock-${randomUUID()}.jpg`,
      provider: 'mock',
      name: file.name,
    },
    { status: 201 },
  )
}
