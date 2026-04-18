'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Product, CartItem } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

const BG = '#3a3a38'
const CARD_BG = '#444442'
const BORDER = 'rgba(255,255,255,0.1)'
const YELLOW = '#F5C200'
const MUTED = 'rgba(255,255,255,0.45)'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('All')

  useEffect(() => {
    fetch('/api/shop/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
  }, [])

  const addToCart = useCallback((product: Product) => {
    setCart(prev => prev.find(i => i.product.id === product.id) ? prev : [...prev, { product, quantity: 1 }])
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price_bdt * i.quantity, 0)
  const cartCount = cart.length

  const productsByDomain = DOMAIN_ORDER.reduce((acc, domain) => {
    const dp = products.filter(p => p.domain === domain)
    if (dp.length > 0) acc[domain] = dp
    return acc
  }, {} as Record<string, Product[]>)

  const allDomains = ['All', ...DOMAIN_ORDER.filter(d => productsByDomain[d])]
  const filteredDomains = activeFilter === 'All'
    ? Object.keys(productsByDomain)
    : [activeFilter].filter(d => productsByDomain[d])

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: BG, borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[60px]">
          {/* Logo */}
          <a href="#" className="text-lg font-black tracking-tight">
            Lucius <span style={{ color: YELLOW }}>AI</span>
          </a>
          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: MUTED }}>
            <a href="#books" className="hover:text-white transition-colors">Books</a>
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#digital" className="hover:text-white transition-colors">Digital Kits</a>
            <Link href="/portal/login" className="hover:text-white transition-colors">My Account</Link>
          </nav>
          {/* CTA */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 text-[11px] font-black tracking-[0.1em] uppercase px-5 py-2.5 transition-opacity hover:opacity-90"
            style={{ backgroundColor: YELLOW, color: '#222' }}
          >
            Shop Now
            {cartCount > 0 ? ` (${cartCount})` : ' →'}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-8 text-[11px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 border" style={{ borderColor: YELLOW, color: YELLOW }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: YELLOW }} />
            Builder · Educator · Author
          </div>
          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
            Frameworks for<br />
            builders in<br />
            <em className="not-italic" style={{ color: YELLOW, fontStyle: 'italic' }}>hard markets.</em>
          </h1>
          {/* Sub */}
          <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: MUTED }}>
            Books, courses, digital toolkits, and coaching built from 7+ years running businesses across Bangladesh&apos;s emerging market.
          </p>
          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#products"
              className="text-[12px] font-black tracking-[0.1em] uppercase px-7 py-3.5 transition-opacity hover:opacity-90"
              style={{ backgroundColor: YELLOW, color: '#222' }}
            >
              Get the Books →
            </a>
            <a
              href="#courses"
              className="text-[12px] font-black tracking-[0.1em] uppercase px-7 py-3.5 border transition-colors hover:border-white"
              style={{ borderColor: BORDER, color: 'rgba(255,255,255,0.7)' }}
            >
              Browse Courses
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-px border" style={{ borderColor: BORDER }}>
          {[
            { num: '7+', label: 'Years Operating' },
            { num: '1K+', label: 'Brands Served' },
            { num: '4K+', label: 'Active Users' },
          ].map(({ num, label }) => (
            <div key={label} className="px-8 py-7 border-b last:border-b-0" style={{ backgroundColor: CARD_BG, borderColor: BORDER }}>
              <div className="text-3xl font-black mb-1" style={{ color: YELLOW }}>{num}</div>
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOMAIN FILTER ── */}
      <div className="sticky top-[60px] z-40 border-b border-t" id="products" style={{ backgroundColor: BG, borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-1 py-2 overflow-x-auto">
          {allDomains.map(domain => (
            <button
              key={domain}
              onClick={() => setActiveFilter(domain)}
              className="flex-shrink-0 text-[11px] font-bold tracking-[0.08em] uppercase px-4 py-2 transition-all whitespace-nowrap"
              style={activeFilter === domain
                ? { backgroundColor: YELLOW, color: '#222' }
                : { color: MUTED, backgroundColor: 'transparent' }
              }
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: YELLOW, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-20">
            {filteredDomains.map(domain => (
              <DomainSection
                key={domain}
                domain={domain}
                products={productsByDomain[domain] || []}
                cart={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t py-10 px-6" style={{ backgroundColor: '#2e2e2c', borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-base font-black tracking-tight">
            Lucius <span style={{ color: YELLOW }}>AI</span>
          </span>
          <div className="flex gap-8 text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: MUTED }}>
            <Link href="/portal/login" className="hover:text-white transition-colors">Customer Portal</Link>
            <a href="mailto:support@lucius.com.bd" className="hover:text-white transition-colors">Support</a>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} Lucius AI</span>
        </div>
      </footer>

      {/* ── CART ── */}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          total={cartTotal}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}

function DomainSection({ domain, products, cart, onAddToCart, onRemoveFromCart }: {
  domain: string
  products: Product[]
  cart: CartItem[]
  onAddToCart: (p: Product) => void
  onRemoveFromCart: (id: string) => void
}) {
  return (
    <section>
      <div className="flex items-baseline gap-5 mb-8">
        <h2 className="text-2xl font-black tracking-tight text-white">{domain}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: MUTED }}>{products.length} items</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px border" style={{ borderColor: BORDER }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            inCart={cart.some(i => i.product.id === product.id)}
            onAdd={() => onAddToCart(product)}
            onRemove={() => onRemoveFromCart(product.id)}
          />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product, inCart, onAdd, onRemove }: {
  product: Product
  inCart: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  const icon = ITEM_TYPE_ICONS[product.item_type] || '📦'

  return (
    <div
      className="flex flex-col gap-5 p-6 transition-colors"
      style={{ backgroundColor: inCart ? 'rgba(245,194,0,0.07)' : CARD_BG }}
    >
      {/* Type */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 border" style={{ borderColor: BORDER, color: MUTED }}>
          {icon} {product.item_type}
        </span>
        {product.is_free && (
          <span className="text-[10px] font-black tracking-[0.1em] uppercase px-2 py-1" style={{ backgroundColor: YELLOW, color: '#222' }}>
            Free
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-sm leading-snug flex-1 text-white">{product.name}</h3>

      {/* Price + Action */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: BORDER }}>
        <span className="font-black text-lg" style={{ color: YELLOW }}>
          {product.is_free ? 'FREE' : formatBDT(product.price_bdt)}
        </span>
        {inCart ? (
          <button
            onClick={onRemove}
            className="text-[10px] font-black tracking-[0.08em] uppercase px-3 py-2 border transition-colors hover:border-white"
            style={{ borderColor: 'rgba(245,194,0,0.4)', color: YELLOW }}
          >
            Remove
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="text-[10px] font-black tracking-[0.08em] uppercase px-3 py-2 transition-opacity hover:opacity-80"
            style={{ backgroundColor: YELLOW, color: '#222' }}
          >
            Add +
          </button>
        )}
      </div>
    </div>
  )
}

function CartSidebar({ cart, total, onRemove, onClose }: {
  cart: CartItem[]
  total: number
  onRemove: (id: string) => void
  onClose: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col border-l" style={{ backgroundColor: '#2e2e2c', borderColor: BORDER }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: BORDER }}>
          <h2 className="font-black text-base tracking-tight">Your Cart <span style={{ color: YELLOW }}>({cart.length})</span></h2>
          <button onClick={onClose} style={{ color: MUTED }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-px">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: MUTED }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-bold">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 border-b" style={{ borderColor: BORDER }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug line-clamp-2 text-white">{item.product.name}</p>
                <p className="text-[11px] mt-1 uppercase tracking-wider font-bold" style={{ color: MUTED }}>{item.product.item_type}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <span className="font-black text-sm" style={{ color: YELLOW }}>
                  {item.product.is_free ? 'FREE' : formatBDT(item.product.price_bdt)}
                </span>
                <button onClick={() => onRemove(item.product.id)} style={{ color: MUTED }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t space-y-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: MUTED }}>Total</span>
              <span className="font-black text-2xl" style={{ color: YELLOW }}>{formatBDT(total)}</span>
            </div>
            <Link
              href={`/shop/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))))}`}
              className="block w-full font-black text-center py-4 text-[12px] tracking-[0.1em] uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: YELLOW, color: '#222' }}
            >
              Proceed to Checkout →
            </Link>
            <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Payment via bKash · Bank transfer · Cash
            </p>
          </div>
        )}
      </div>
    </>
  )
}
