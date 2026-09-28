import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {session?.user?.name || session?.user?.email}. You have ADMIN privileges.</p>
    </div>
  )
}
