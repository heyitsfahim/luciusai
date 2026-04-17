'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputClass = "w-full border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-colors text-sm"
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }

export default function PortalLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/portal/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Login failed')
      setLoading(false)
      return
    }

    router.push('/portal')
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#3d3d3d' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/shop" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
          </Link>
          <h1 className="text-2xl font-black text-white">Customer Portal</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Access your courses and downloads</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} style={inputStyle} placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass} style={inputStyle} placeholder="••••••••" />
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl border" style={{ backgroundColor: 'rgba(220,50,50,0.1)', borderColor: 'rgba(220,50,50,0.25)', color: '#ff8080' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Don&apos;t have access yet?{' '}
            <Link href="/shop" style={{ color: '#F5C200' }} className="hover:opacity-80 transition-opacity">
              Browse courses →
            </Link>
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Your password is set by the admin after order confirmation.{' '}
            <a href="mailto:support@lucius.com.bd" className="underline" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Need help?
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
