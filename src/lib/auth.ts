import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const hasConfiguredGoogleCredential = (value: string | undefined) => Boolean(value && !value.startsWith('your-'))
const googleCredentials = hasConfiguredGoogleCredential(process.env.GOOGLE_CLIENT_ID)
  && hasConfiguredGoogleCredential(process.env.GOOGLE_CLIENT_SECRET)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    ...(googleCredentials
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const forwardedFor = req.headers?.['x-forwarded-for']
        const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || '127.0.0.1'
        
        // Rate Limiting Logic
        const attempts = await prisma.loginAttempt.count({
          where: {
            ip,
            createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // last 15 mins
          }
        })
        
        if (attempts >= 5) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          await prisma.loginAttempt.create({ data: { ip, email: credentials.email } })
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          await prisma.loginAttempt.create({ data: { ip, email: credentials.email } })
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone Number', type: 'text' },
        otp: { label: 'OTP Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error('Phone and OTP required')
        }

        // Mock Provider Logic
        if (credentials.otp === '123456') {
          const user = await prisma.user.upsert({
            where: { phone: credentials.phone },
            update: {},
            create: {
              phone: credentials.phone,
              name: `User ${credentials.phone}`,
              phoneVerified: new Date(),
            },
          })
          return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
          }
        }
        
        throw new Error('Invalid OTP')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.phone = token.phone
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.AUTH_SECRET || 'fallback-secret',
}
