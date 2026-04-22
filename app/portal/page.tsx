'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types/shop'
import { ITEM_TYPE_ICONS } from '@/lib/shop-db'

interface AccessItem { product_id: string; products: Product }
interface PortalData {
  customer: { id: string; email: string; name: string }
  access: AccessItem[]
}

export default function PortalPage() {
  const router = useRouter()
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/me')
      .then(r => { if (r.status === 401) { router.push('/portal/login'); return null } return r.json() })
      .then(d => { if (d) { setData(d); setLoading(false) } })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/portal/login', { method: 'DELETE' })
    router.push('/portal/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const courses = data?.access.filter(a => a.products?.item_type === 'Video Course') || []
  const downloads = data?.access.filter(a => ['Digital File', 'PDF'].includes(a.products?.item_type)) || []

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      {/* Header */}
      <header className="border-b border-white/10" style={{ backgroundColor: '#333333' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/shop" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
              <span className="font-bold text-sm">Fahim<span style={{ color: '#F5C200' }}>Salam</span></span>
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>My Library</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block" style={{ color: 'rgba(255,255,255,0.4)' }}>{data?.customer.name}</span>
            <button onClick={handleLogout} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-black text-white">Welcome back, {data?.customer.name?.split(' ')[0]}!</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {data?.access.length === 0
              ? 'You haven\'t unlocked any content yet.'
              : `${data?.access.length} item${data!.access.length !== 1 ? 's' : ''} in your library`}
          </p>
        </div>

        {data?.access.length === 0 ? (
          <div className="rounded-2xl py-16 text-center border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <div className="text-5xl mb-4">📚</div>
            <h2 className="font-bold text-lg mb-2 text-white">Your library is empty</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Purchase courses and digital products to access them here.</p>
            <Link href="/shop" className="font-bold px-6 py-3 rounded-xl text-sm transition-colors" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Video Courses */}
            {courses.length > 0 && (
              <section>
                <h2 className="font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>🎬</span> Video Courses
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map(item => (
                    <Link
                      key={item.product_id}
                      href={`/portal/course/${item.product_id}`}
                      className="group rounded-2xl p-5 transition-all duration-200 border border-white/10 hover:border-[#2878B5]/50"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 border" style={{ backgroundColor: 'rgba(40,120,181,0.12)', borderColor: 'rgba(40,120,181,0.3)' }}>🎬</div>
                      <h3 className="font-semibold text-sm leading-snug text-white group-hover:opacity-80 transition-opacity">
                        {item.products.name}
                      </h3>
                      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.products.domain}</p>
                      <div className="flex items-center gap-1 mt-4 text-xs font-semibold" style={{ color: '#2878B5' }}>
                        Start Learning
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Downloads */}
            {downloads.length > 0 && (
              <section>
                <h2 className="font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>💾</span> Downloads & Files
                </h2>
                <div className="rounded-2xl divide-y divide-white/5 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  {downloads.map(item => (
                    <Link
                      key={item.product_id}
                      href={`/portal/downloads/${item.product_id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border" style={{ backgroundColor: 'rgba(245,194,0,0.1)', borderColor: 'rgba(245,194,0,0.25)' }}>
                        {ITEM_TYPE_ICONS[item.products.item_type] || '💾'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white group-hover:opacity-80 transition-opacity">{item.products.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.products.item_type} · {item.products.domain}</p>
                      </div>
                      <svg className="w-4 h-4 flex-shrink-0 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
