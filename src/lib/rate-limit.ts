import { prisma } from '@/lib/prisma'

const isDev = process.env.NODE_ENV === 'development'

export async function enforceRateLimit(request: Request, scope: string, limit = 30) {
  if (isDev) return true // skip rate limiting during local development
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || '127.0.0.1'
  const since = new Date(Date.now() - 15 * 60 * 1000)
  const attempts = await prisma.loginAttempt.count({ where: { ip, email: scope, createdAt: { gte: since } } })
  if (attempts >= limit) return false
  await prisma.loginAttempt.create({ data: { ip, email: scope } })
  return true
}