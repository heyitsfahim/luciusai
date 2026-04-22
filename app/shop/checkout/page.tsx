'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types/shop'
import { formatBDT } from '@/lib/shop-db'

interface CartItem { product_id: string; quantity: number }

const inputClass = "w-full border rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none transition-colors text-sm"
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }

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
    try { setCartItems(JSON.parse(decodeURIComponent(itemsParam))) }
    catch { router.push('/shop') }
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#333333' }}>
        <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
            <span className="font-bold text-sm tracking-tight">Fahim<span style={{ color: '#F5C200' }}>Salam</span></span>
          </Link>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Checkout</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold mb-8 text-white">Your Details</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahim Uddin" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Email Address *</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rahim@example.com" className={inputClass} style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Access to digital products will be sent to this email</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Phone / WhatsApp</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Order Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Delivery address for physical books, special requests..." rows={3} className={`${inputClass} resize-none`} style={inputStyle} />
              </div>

              {error && (
                <div className="text-sm px-4 py-3 rounded-xl border" style={{ backgroundColor: 'rgba(220,50,50,0.1)', borderColor: 'rgba(220,50,50,0.25)', color: '#ff8080' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="w-full font-bold py-4 rounded-xl transition-colors text-sm disabled:opacity-50" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
                {submitting ? 'Placing Order...' : 'Place Order →'}
              </button>
            </form>

            {/* Payment info */}
            {hasPaidItems && (
              <div className="mt-8 rounded-2xl p-5 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                  <span className="text-lg">💳</span> Payment Instructions
                </h3>
                <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <p>After placing your order, pay using one of the methods below and include your <span className="text-white font-medium">Order Number</span> as the reference:</p>
                  <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>bKash</p>
                        <p className="font-mono font-bold text-white">01XXXXXXXXXX</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏦</span>
                      <div>
                        <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Bank Transfer</p>
                        <p className="text-sm text-white">Contact us for bank details</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Access to digital items will be activated within 24 hours of payment confirmation.</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6 sticky top-6 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <h2 className="font-bold text-xs uppercase tracking-wider mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>Order Summary</h2>
              <div className="space-y-4 mb-6">
                {lineItems.map(item => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.product!.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.product!.item_type}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#F5C200' }}>
                      {item.product!.is_free ? 'FREE' : formatBDT(item.product!.price_bdt)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Total</span>
                  <span className="font-black text-xl" style={{ color: '#F5C200' }}>{formatBDT(total)}</span>
                </div>
              </div>
              <Link href="/shop" className="block text-center text-xs mt-4 transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  )
}
