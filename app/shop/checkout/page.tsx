'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types/shop'
import { formatBDT } from '@/lib/shop-db'

interface CartItem { product_id: string; quantity: number }

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })

  useEffect(() => {
    const itemsParam = searchParams.get('items')
    if (!itemsParam) { router.push('/shop'); return }
    try {
      setCartItems(JSON.parse(decodeURIComponent(itemsParam)))
    } catch {
      router.push('/shop')
    }
  }, [searchParams, router])

  useEffect(() => {
    if (!cartItems.length) return
    fetch('/api/shop/products')
      .then(r => r.json())
      .then((data: Product[]) => {
        setProducts(data.filter(p => cartItems.some(i => i.product_id === p.id)))
        setLoading(false)
      })
  }, [cartItems])

  const lineItems = cartItems.map(ci => ({
    ...ci,
    product: products.find(p => p.id === ci.product_id),
  })).filter(i => i.product)

  const total = lineItems.reduce((sum, i) => sum + (i.product!.price_bdt * i.quantity), 0)
  const hasPaidItems = lineItems.some(i => i.product!.price_bdt > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/shop/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        notes: form.notes || null,
        items: cartItems,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`/shop/success?order=${data.order_number}&total=${data.total_bdt}&email=${encodeURIComponent(form.email)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs">L</div>
            <span className="font-bold text-sm tracking-tight">Lucius</span>
          </Link>
          <span className="text-white/40 text-sm">Checkout</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold mb-8">Your Details</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Rahim Uddin"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="rahim@example.com"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-colors"
                />
                <p className="text-white/30 text-xs mt-1.5">Access to digital products will be sent to this email</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Delivery address for physical books, special requests..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors text-sm"
              >
                {submitting ? 'Placing Order...' : 'Place Order →'}
              </button>
            </form>

            {/* Payment info */}
            {hasPaidItems && (
              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-lg">💳</span> Payment Instructions
                </h3>
                <div className="space-y-3 text-sm text-white/60">
                  <p>After placing your order, pay using one of the methods below and include your <span className="text-white font-medium">Order Number</span> as the reference:</p>
                  <div className="bg-black/30 rounded-xl p-4 space-y-2.5 text-white/80">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="font-semibold text-xs text-white/50 uppercase tracking-wider">bKash</p>
                        <p className="font-mono font-bold">01XXXXXXXXXX</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏦</span>
                      <div>
                        <p className="font-semibold text-xs text-white/50 uppercase tracking-wider">Bank Transfer</p>
                        <p className="text-sm">Contact us for bank details</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs">Access to digital items will be activated within 24 hours of payment confirmation.</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6">
              <h2 className="font-bold text-sm uppercase tracking-wider text-white/50 mb-5">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {lineItems.map(item => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/85 leading-snug line-clamp-2">{item.product!.name}</p>
                      <p className="text-xs text-white/35 mt-0.5">{item.product!.item_type}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-400 flex-shrink-0">
                      {item.product!.is_free ? 'FREE' : formatBDT(item.product!.price_bdt)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Total</span>
                  <span className="font-black text-xl text-amber-400">{formatBDT(total)}</span>
                </div>
              </div>
              <Link
                href="/shop"
                className="block text-center text-white/40 hover:text-white/70 text-xs mt-4 transition-colors"
              >
                ← Edit cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  )
}
