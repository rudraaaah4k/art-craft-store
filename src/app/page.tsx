import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Art & Craft Marketplace</h1>
      
      {session ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center text-black">
          <p className="mb-2">Logged in as: <strong>{session.user?.name || session.user?.email || 'User'}</strong></p>
          <p className="mb-4 text-sm text-gray-500">Role: {session.user?.role}</p>
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="/admin" className="text-blue-600 hover:underline">Go to Admin</Link>
          </div>
          <LogoutButton />
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</Link>
          <Link href="/auth/register" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Register</Link>
        </div>
      )}
    </main>
  )
}
