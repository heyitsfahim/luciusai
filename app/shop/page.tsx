'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Product, CartItem } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

const BG = '#3a3a38'
const CARD = '#424240'
const BORDER = 'rgba(255,255,255,0.1)'
const YELLOW = '#F5C200'
const MUTED = 'rgba(255,255,255,0.45)'
const DIM = 'rgba(255,255,255,0.25)'

const TICKER_ITEMS = [
  'BOOKS', 'VIDEO COURSES', 'DIGITAL KITS', 'E-COMMERCE', 'SALES FRAMEWORKS',
  'COMMUNICATION', 'EMERGING MARKETS', 'BUSINESS TOOLS', 'SUPPLY CHAIN', 'GROWTH PLAYBOOKS',
]

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

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id))
  }, [])

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price_bdt * i.quantity, 0)

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
    <div className="min-h-screen text-white" style={{ backgroundColor: BG }}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker 30s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: BG, borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[58px]">
          <a href="#" className="text-base font-black tracking-tight">
            Lucius <span style={{ color: YELLOW }}>AI</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-[11px] font-bold tracking-[0.13em] uppercase" style={{ color: MUTED }}>
            <a href="#books" className="hover:text-white transition-colors">Books</a>
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#kits" className="hover:text-white transition-colors">Digital Kits</a>
            <a href="#free" className="hover:text-white transition-colors">Free Resources</a>
            <Link href="/portal/login" className="hover:text-white transition-colors">My Account</Link>
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="text-[11px] font-black tracking-[0.1em] uppercase px-5 py-2.5 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}
          >
            Shop Now {cart.length > 0 ? `(${cart.length})` : '→'}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 mb-8 text-[10px] font-black tracking-[0.18em] uppercase px-3 py-1.5 border" style={{ borderColor: YELLOW, color: YELLOW }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: YELLOW }} />
              Builder · Educator · Operator
            </div>
            <h1 className="text-5xl lg:text-[3.75rem] font-black leading-[1.04] mb-6 tracking-tight">
              Frameworks for<br />
              builders in<br />
              <em className="not-italic" style={{ color: YELLOW, fontStyle: 'italic' }}>hard markets.</em>
            </h1>
            <p className="text-[15px] leading-relaxed mb-10 max-w-[440px]" style={{ color: MUTED }}>
              Books, courses, digital toolkits, and coaching built from 7+ years running
              logistics, e-commerce, and supply chain businesses across Bangladesh&apos;s emerging market.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#books" className="text-[11px] font-black tracking-[0.1em] uppercase px-7 py-3.5 hover:opacity-90 transition-opacity" style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}>
                Get the Books →
              </a>
              <a href="#courses" className="text-[11px] font-black tracking-[0.1em] uppercase px-7 py-3.5 border hover:border-white transition-colors" style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}>
                Browse Courses
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="border" style={{ borderColor: BORDER }}>
            {[
              { num: '7+', label: 'Years Operating' },
              { num: '1K+', label: 'Brands Served' },
              { num: '4K+', label: 'Active Users' },
            ].map(({ num, label }, i) => (
              <div key={label} className={`px-10 py-8 ${i < 2 ? 'border-b' : ''}`} style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <div className="text-4xl font-black mb-1" style={{ color: YELLOW }}>{num}</div>
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="overflow-hidden border-y py-4" style={{ borderColor: BORDER, backgroundColor: '#2e2e2c' }}>
        <div className="ticker-track flex gap-0 whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-8 text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: MUTED }}>
              {item}
              <span style={{ color: YELLOW }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── DOMAIN FILTER ── */}
      <div className="sticky top-[58px] z-40 border-b" id="products" style={{ backgroundColor: BG, borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-0 py-0 overflow-x-auto">
          {allDomains.map(domain => (
            <button
              key={domain}
              onClick={() => setActiveFilter(domain)}
              className="flex-shrink-0 text-[10px] font-black tracking-[0.1em] uppercase px-5 py-3.5 border-r transition-colors whitespace-nowrap"
              style={{
                borderColor: BORDER,
                backgroundColor: activeFilter === domain ? YELLOW : 'transparent',
                color: activeFilter === domain ? '#1e1e1c' : MUTED,
              }}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: YELLOW, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-24">
            {filteredDomains.map(domain => (
              <DomainSection
                key={domain}
                domain={domain}
                products={productsByDomain[domain] || []}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── AUTHOR ── */}
      <section className="border-t" style={{ borderColor: BORDER, backgroundColor: '#2e2e2c' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-6" style={{ color: YELLOW }}>The Operator</p>
            <h2 className="text-3xl font-black mb-6 leading-tight">Not a guru.<br />An operator.</h2>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: MUTED }}>
              7+ years building venture-backed logistics and supply chain companies in Bangladesh.
              The books aren&apos;t theory — they&apos;re what actually works when the infrastructure,
              data, and capital don&apos;t exist yet.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#books" className="text-[11px] font-black tracking-[0.1em] uppercase px-6 py-3 hover:opacity-90 transition-opacity" style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}>
                Order Now →
              </a>
              <a href="#products" className="text-[11px] font-black tracking-[0.1em] uppercase px-6 py-3 border hover:border-white transition-colors" style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}>
                Bundle &amp; Save
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border" style={{ borderColor: BORDER }}>
            {[
              { num: '7+', label: 'Years in Emerging Market Operations' },
              { num: '1K+', label: 'E-Commerce Brands Served' },
              { num: '4K+', label: 'Monthly Active Platform Users' },
              { num: '2', label: 'Flagship Books in the Market' },
            ].map(({ num, label }) => (
              <div key={label} className="p-7 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <div className="text-3xl font-black mb-2" style={{ color: YELLOW }}>{num}</div>
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase leading-relaxed" style={{ color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-8 px-6" style={{ backgroundColor: '#242422', borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-base">Lucius <span style={{ color: YELLOW }}>AI</span></span>
          <div className="flex gap-8 text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: MUTED }}>
            <a href="#books">Books</a>
            <a href="#courses">Courses</a>
            <a href="#kits">Kits</a>
            <a href="#free">Free PDFs</a>
            <Link href="/portal/login" className="hover:text-white transition-colors">My Account</Link>
          </div>
          <span className="text-[11px]" style={{ color: DIM }}>© {new Date().getFullYear()} Lucius AI. All rights reserved.</span>
        </div>
      </footer>

      {/* ── CART ── */}
      {cartOpen && (
        <CartSidebar cart={cart} total={cartTotal} onRemove={removeFromCart} onClose={() => setCartOpen(false)} />
      )}
    </div>
  )
}

function DomainSection({ domain, products, cart, onAdd, onRemove }: {
  domain: string
  products: Product[]
  cart: CartItem[]
  onAdd: (p: Product) => void
  onRemove: (id: string) => void
}) {
  const hasBooks = products.some(p => p.item_type === 'Physical Book')
  const hasCourses = products.some(p => p.item_type === 'Video Course')

  const anchorId = hasBooks ? 'books' : hasCourses ? 'courses' : domain.toLowerCase().replace(/\s+/g, '-')

  return (
    <section id={anchorId}>
      {/* Section header */}
      <div className="flex items-baseline gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">{domain}</h2>
          <p className="text-[12px] mt-1 font-bold" style={{ color: MUTED }}>
            {products.length} {products.length === 1 ? 'item' : 'items'} · {products[0]?.item_type}
          </p>
        </div>
        <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
      </div>

      {/* Book layout */}
      {hasBooks ? (
        <div className="space-y-px border" style={{ borderColor: BORDER }}>
          {products.map((product, i) => (
            <BookRow
              key={product.id}
              product={product}
              vol={i + 1}
              inCart={cart.some(c => c.product.id === product.id)}
              onAdd={() => onAdd(product)}
              onRemove={() => onRemove(product.id)}
            />
          ))}
        </div>
      ) : hasCourses ? (
        <div className="space-y-px border" style={{ borderColor: BORDER }}>
          {products.map(product => (
            <CourseRow
              key={product.id}
              product={product}
              domain={domain}
              inCart={cart.some(c => c.product.id === product.id)}
              onAdd={() => onAdd(product)}
              onRemove={() => onRemove(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border" style={{ borderColor: BORDER }}>
          {products.map(product => (
            <KitCard
              key={product.id}
              product={product}
              inCart={cart.some(c => c.product.id === product.id)}
              onAdd={() => onAdd(product)}
              onRemove={() => onRemove(product.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function BookRow({ product, vol, inCart, onAdd, onRemove }: {
  product: Product
  vol: number
  inCart: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-6 p-7 border-l-4 transition-colors"
      style={{ backgroundColor: inCart ? 'rgba(245,194,0,0.05)' : CARD, borderLeftColor: inCart ? YELLOW : 'transparent' }}
    >
      <div className="flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center border text-center" style={{ borderColor: BORDER }}>
        <span className="text-[9px] font-black tracking-[0.15em] uppercase" style={{ color: MUTED }}>Vol.</span>
        <span className="text-xl font-black" style={{ color: YELLOW }}>{String(vol).padStart(2, '0')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-1" style={{ color: MUTED }}>Physical Book</p>
        <h3 className="text-lg font-black text-white leading-tight">{product.name}</h3>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0">
        <span className="text-2xl font-black" style={{ color: YELLOW }}>
          {product.is_free ? 'FREE' : formatBDT(product.price_bdt)}
        </span>
        {inCart ? (
          <button onClick={onRemove} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 border hover:border-white transition-colors" style={{ borderColor: 'rgba(245,194,0,0.5)', color: YELLOW }}>
            Remove ✕
          </button>
        ) : (
          <button onClick={onAdd} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 hover:opacity-90 transition-opacity" style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}>
            Order →
          </button>
        )}
      </div>
    </div>
  )
}

function CourseRow({ product, domain, inCart, onAdd, onRemove }: {
  product: Product
  domain: string
  inCart: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-6 p-7 transition-colors"
      style={{ backgroundColor: inCart ? 'rgba(245,194,0,0.05)' : CARD }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-2" style={{ color: MUTED }}>
          {domain} · Video Course
        </p>
        <h3 className="text-base font-black text-white">{product.name}</h3>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-right">
          <span className="text-2xl font-black block" style={{ color: YELLOW }}>
            {product.is_free ? 'FREE' : formatBDT(product.price_bdt)}
          </span>
          {!product.is_free && <span className="text-[10px] font-bold" style={{ color: MUTED }}>/ lifetime</span>}
        </div>
        {inCart ? (
          <button onClick={onRemove} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 border hover:border-white transition-colors" style={{ borderColor: 'rgba(245,194,0,0.5)', color: YELLOW }}>
            Remove ✕
          </button>
        ) : (
          <button onClick={onAdd} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 hover:opacity-90 transition-opacity" style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}>
            Enroll →
          </button>
        )}
      </div>
    </div>
  )
}

function KitCard({ product, inCart, onAdd, onRemove }: {
  product: Product
  inCart: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  const icon = ITEM_TYPE_ICONS[product.item_type] || '📦'
  return (
    <div
      className="flex flex-col gap-5 p-7 transition-colors"
      style={{ backgroundColor: inCart ? 'rgba(245,194,0,0.05)' : CARD }}
    >
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-2" style={{ color: MUTED }}>{product.item_type}</p>
        <h3 className="font-black text-white leading-snug">{product.name}</h3>
      </div>
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: BORDER }}>
        <span className="text-xl font-black" style={{ color: YELLOW }}>
          {product.is_free ? 'FREE' : formatBDT(product.price_bdt)}
        </span>
        {inCart ? (
          <button onClick={onRemove} className="text-[10px] font-black tracking-[0.1em] uppercase px-4 py-2 border" style={{ borderColor: 'rgba(245,194,0,0.5)', color: YELLOW }}>
            Remove ✕
          </button>
        ) : (
          <button onClick={onAdd} className="text-[10px] font-black tracking-[0.1em] uppercase px-4 py-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}>
            Get Kit →
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col border-l" style={{ backgroundColor: '#2a2a28', borderColor: BORDER }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: BORDER }}>
          <h2 className="font-black text-base">Your Cart <span style={{ color: YELLOW }}>({cart.length})</span></h2>
          <button onClick={onClose} style={{ color: MUTED }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: MUTED }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-bold">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="flex gap-4 px-6 py-4 border-b" style={{ borderColor: BORDER }}>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-[0.12em] uppercase mb-1" style={{ color: MUTED }}>{item.product.item_type}</p>
                <p className="text-sm font-bold leading-snug text-white line-clamp-2">{item.product.name}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-black text-sm" style={{ color: YELLOW }}>
                  {item.product.is_free ? 'FREE' : formatBDT(item.product.price_bdt)}
                </span>
                <button onClick={() => onRemove(item.product.id)} style={{ color: DIM }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t space-y-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: MUTED }}>Total</span>
              <span className="font-black text-2xl" style={{ color: YELLOW }}>{formatBDT(total)}</span>
            </div>
            <Link
              href={`/shop/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))))}`}
              className="block w-full font-black text-center py-4 text-[11px] tracking-[0.12em] uppercase hover:opacity-90 transition-opacity"
              style={{ backgroundColor: YELLOW, color: '#1e1e1c' }}
            >
              Proceed to Checkout →
            </Link>
            <p className="text-center text-[11px]" style={{ color: DIM }}>
              Payment via bKash · Bank transfer · Cash
            </p>
          </div>
        )}
      </div>
    </>
  )
}
