import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registrationSchema } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0].trim() || '127.0.0.1'
    const attempts = await prisma.loginAttempt.count({
      where: {
        ip,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    })

    if (attempts >= 5) {
      return NextResponse.json({ message: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const parsedBody = registrationSchema.safeParse(await req.json())

    if (!parsedBody.success) {
      await prisma.loginAttempt.create({ data: { ip } })
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 })
    }

    const { name, email, password } = parsedBody.data

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      await prisma.loginAttempt.create({ data: { ip, email } })
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email } }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
