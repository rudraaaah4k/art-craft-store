'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    
    if (res?.error) {
      setError(res.error)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simplified Phone OTP mock for UI
    const phone = prompt('Enter phone number')
    if (!phone) return
    const otp = prompt('Enter OTP (use 123456 for mock)')
    if (!otp) return
    
    const res = await signIn('phone-otp', {
      phone,
      otp,
      redirect: false
    })
    
    if (res?.error) {
      setError(res.error)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required 
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login with Email
          </button>
        </form>

        <div className="mt-6 flex flex-col space-y-3">
          <button 
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full py-2 px-4 border rounded hover:bg-gray-50 flex justify-center items-center"
          >
            Sign in with Google
          </button>
          
          <button 
            onClick={handlePhoneLogin}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Login with Phone OTP
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm">
          Don't have an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Register</Link>
        </div>
      </div>
    </div>
  )
}
