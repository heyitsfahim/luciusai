'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DigitalAsset, Product } from '@/types/shop'

interface DownloadsData {
  product: Product
  assets: DigitalAsset[]
}

export default function DownloadsPage({ params }: { params: { productId: string } }) {
  const router = useRouter()
  const [data, setData] = useState<DownloadsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/portal/downloads/${params.productId}`)
      .then(r => {
        if (r.status === 401) { router.push('/portal/login'); return null }
        if (r.status === 403) { router.push('/portal'); return null }
        return r.json()
      })
      .then(d => { if (d) { setData(d); setLoading(false) } })
  }, [params.productId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-[#111] border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/portal" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm text-white/60">My Library</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <span className="text-xs text-white/40 uppercase tracking-wider">{data?.product.domain}</span>
          <h1 className="text-2xl font-black mt-1">{data?.product.name}</h1>
          <p className="text-white/40 text-sm mt-1">{data?.product.item_type}</p>
        </div>

        {data?.assets.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center text-white/30">
            <div className="text-4xl mb-3">📦</div>
            <p>No files available yet.</p>
            <p className="text-xs mt-2">The admin will upload your files soon. Check back later.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
            {data?.assets.map(asset => (
              <a
                key={asset.id}
                href={asset.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-xl flex-shrink-0">
                  {asset.file_type === 'pdf' ? '📄' : asset.file_type === 'xlsx' ? '📊' : asset.file_type === 'docx' ? '📝' : '💾'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">{asset.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {asset.file_type ? `.${asset.file_type.toUpperCase()}` : 'File'}
                    {asset.file_size_bytes ? ` · ${(asset.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-amber-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
