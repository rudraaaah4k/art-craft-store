import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getAdminApiSession } from '@/lib/admin'

export async function POST(request: Request) {
  if (!await getAdminApiSession()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: 'Choose an image file' }, { status: 400 })
  }

  const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  return NextResponse.json({
    url: configured ? `/uploads/cloudinary-pending-${randomUUID()}.jpg` : `/uploads/mock-${randomUUID()}.jpg`,
    provider: configured ? 'cloudinary-ready' : 'mock',
    name: file.name,
  }, { status: 201 })
}
