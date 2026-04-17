'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types/shop'
import { ITEM_TYPE_ICONS } from '@/lib/shop-db'

interface AccessItem {
  product_id: string
  products: Product
}

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
      .then(r => {
        if (r.status === 401) { router.push('/portal/login'); return null }
        return r.json()
      })
      .then(d => { if (d) { setData(d); setLoading(false) } })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/portal/login', { method: 'DELETE' })
    router.push('/portal/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const courses = data?.access.filter(a => a.products?.item_type === 'Video Course') || []
  const downloads = data?.access.filter(a => ['Digital File', 'PDF'].includes(a.products?.item_type)) || []

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/shop" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs">L</div>
              <span className="font-bold text-sm">Lucius</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm">My Library</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm hidden sm:block">{data?.customer.name}</span>
            <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white/70 transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-black">Welcome back, {data?.customer.name?.split(' ')[0]}!</h1>
          <p className="text-white/40 text-sm mt-1">
            {data?.access.length === 0
              ? 'You haven\'t unlocked any content yet.'
              : `${data?.access.length} item${data!.access.length !== 1 ? 's' : ''} in your library`}
          </p>
        </div>

        {data?.access.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="font-bold text-lg mb-2">Your library is empty</h2>
            <p className="text-white/40 text-sm mb-6">Purchase courses and digital products to access them here.</p>
            <Link href="/shop" className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Video Courses */}
            {courses.length > 0 && (
              <section>
                <h2 className="font-bold text-white/70 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>🎬</span> Video Courses
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map(item => (
                    <Link
                      key={item.product_id}
                      href={`/portal/course/${item.product_id}`}
                      className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-amber-400/30 rounded-2xl p-5 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-xl mb-4">🎬</div>
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-amber-400 transition-colors">
                        {item.products.name}
                      </h3>
                      <p className="text-white/40 text-xs mt-2">{item.products.domain}</p>
                      <div className="flex items-center gap-1 mt-4 text-amber-400 text-xs font-semibold">
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
                <h2 className="font-bold text-white/70 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>💾</span> Downloads & Files
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                  {downloads.map(item => (
                    <Link
                      key={item.product_id}
                      href={`/portal/downloads/${item.product_id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-lg flex-shrink-0">
                        {ITEM_TYPE_ICONS[item.products.item_type] || '💾'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">{item.products.name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{item.products.item_type} · {item.products.domain}</p>
                      </div>
                      <svg className="w-4 h-4 text-white/30 group-hover:text-amber-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
