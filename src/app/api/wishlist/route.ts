import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { verifyCsrfOrigin } from '@/lib/csrf'

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) return NextResponse.json({ message: 'CSRF verification failed' }, { status: 403 })
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      products: { connect: { id: productId } }
    },
    update: {
      products: { connect: { id: productId } }
    }
  })

  return NextResponse.json({ message: 'Added to wishlist' })
}

export async function DELETE(request: Request) {
  if (!verifyCsrfOrigin(request)) return NextResponse.json({ message: 'CSRF verification failed' }, { status: 403 })
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  try {
    await prisma.wishlist.update({
      where: { userId: session.user.id },
      data: {
        products: { disconnect: { id: productId } }
      }
    })
  } catch {
    // Ignore if wishlist doesn't exist
  }

  return NextResponse.json({ message: 'Removed from wishlist' })
}
