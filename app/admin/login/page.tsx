'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputClass = "w-full border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-colors text-sm"
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/login', {
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

    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4" style={{ backgroundColor: '#3d3d3d' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Fahim Salam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} style={inputStyle} placeholder="admin@lucius.com.bd" />
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
      </div>
    </div>
  )
}
