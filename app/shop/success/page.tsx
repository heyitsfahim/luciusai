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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto text-4xl">
          {isPaid ? '🎉' : '✅'}
        </div>

        <div>
          <h1 className="text-3xl font-black mb-3">Order Received!</h1>
          <p className="text-white/50">
            {isPaid
              ? 'Your free items are ready. Check your email for access instructions.'
              : 'We\'ve received your order. Please complete payment to get access.'}
          </p>
        </div>

        {/* Order details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Order Number</span>
            <span className="font-mono font-bold text-amber-400">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Email</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Total</span>
            <span className="font-bold text-lg text-amber-400">{formatBDT(total)}</span>
          </div>
        </div>

        {/* Next steps */}
        {!isPaid && (
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 text-left">
            <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
              <span>📱</span> Next Step: Pay via bKash
            </h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>1. Send <span className="text-white font-bold">{formatBDT(total)}</span> to bKash: <span className="font-mono font-bold text-white">01XXXXXXXXXX</span></p>
              <p>2. Use reference: <span className="font-mono font-bold text-amber-400">{orderNumber}</span></p>
              <p>3. You&apos;ll receive access within <span className="text-white font-semibold">24 hours</span> after payment</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portal/login"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Access My Courses →
          </Link>
          <Link
            href="/shop"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="text-white/30 text-xs">
          Questions? Email <a href="mailto:support@lucius.com.bd" className="underline hover:text-white/60">support@lucius.com.bd</a>
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
