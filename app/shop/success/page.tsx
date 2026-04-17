'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatBDT } from '@/lib/shop-db'

function SuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order') || ''
  const total = parseInt(params.get('total') || '0')
  const email = params.get('email') || ''
  const isPaid = total === 0

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-16" style={{ backgroundColor: '#3d3d3d' }}>
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto text-4xl" style={{ backgroundColor: 'rgba(245,194,0,0.1)', borderColor: 'rgba(245,194,0,0.35)' }}>
          {isPaid ? '🎉' : '✅'}
        </div>

        <div>
          <h1 className="text-3xl font-black mb-3 text-white">Order Received!</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isPaid
              ? 'Your free items are ready. Check your email for access instructions.'
              : 'We\'ve received your order. Please complete payment to get access.'}
          </p>
        </div>

        {/* Order details */}
        <div className="rounded-2xl p-6 text-left space-y-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Order Number</span>
            <span className="font-mono font-bold" style={{ color: '#F5C200' }}>{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</span>
            <span className="text-sm font-medium text-white">{email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Total</span>
            <span className="font-bold text-lg" style={{ color: '#F5C200' }}>{formatBDT(total)}</span>
          </div>
        </div>

        {/* Next steps */}
        {!isPaid && (
          <div className="rounded-2xl p-5 text-left border" style={{ backgroundColor: 'rgba(245,194,0,0.06)', borderColor: 'rgba(245,194,0,0.25)' }}>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#F5C200' }}>
              <span>📱</span> Next Step: Pay via bKash
            </h3>
            <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <p>1. Send <span className="text-white font-bold">{formatBDT(total)}</span> to bKash: <span className="font-mono font-bold text-white">01XXXXXXXXXX</span></p>
              <p>2. Use reference: <span className="font-mono font-bold" style={{ color: '#F5C200' }}>{orderNumber}</span></p>
              <p>3. You&apos;ll receive access within <span className="text-white font-semibold">24 hours</span> after payment</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/portal/login" className="font-bold px-6 py-3 rounded-xl transition-colors text-sm" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
            Access My Courses →
          </Link>
          <Link href="/shop" className="font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/15 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            Continue Shopping
          </Link>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Questions? Email <a href="mailto:support@lucius.com.bd" className="underline" style={{ color: 'rgba(255,255,255,0.5)' }}>support@lucius.com.bd</a>
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
