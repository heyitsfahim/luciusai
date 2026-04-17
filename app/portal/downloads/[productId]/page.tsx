'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DigitalAsset, Product } from '@/types/shop'

interface DownloadsData { product: Product; assets: DigitalAsset[] }

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      <header className="border-b border-white/10" style={{ backgroundColor: '#333333' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/portal" className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>My Library</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{data?.product.domain}</span>
          <h1 className="text-2xl font-black mt-1 text-white">{data?.product.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{data?.product.item_type}</p>
        </div>

        {data?.assets.length === 0 ? (
          <div className="rounded-2xl py-16 text-center border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
            <div className="text-4xl mb-3">📦</div>
            <p>No files available yet.</p>
            <p className="text-xs mt-2">The admin will upload your files soon. Check back later.</p>
          </div>
        ) : (
          <div className="rounded-2xl divide-y divide-white/5 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            {data?.assets.map(asset => (
              <a
                key={asset.id}
                href={asset.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border" style={{ backgroundColor: 'rgba(245,194,0,0.1)', borderColor: 'rgba(245,194,0,0.25)' }}>
                  {asset.file_type === 'pdf' ? '📄' : asset.file_type === 'xlsx' ? '📊' : asset.file_type === 'docx' ? '📝' : '💾'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white group-hover:opacity-80 transition-opacity">{asset.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {asset.file_type ? `.${asset.file_type.toUpperCase()}` : 'File'}
                    {asset.file_size_bytes ? ` · ${(asset.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                  </p>
                </div>
                <svg className="w-5 h-5 flex-shrink-0 transition-colors group-hover:opacity-80" style={{ color: '#F5C200' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
