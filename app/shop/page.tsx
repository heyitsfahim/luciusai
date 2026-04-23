'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Product, CartItem } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

const BG = '#2a2a28'
const CARD = '#323230'
const BORDER = 'rgba(255,255,255,0.09)'
const YELLOW = '#F5C200'
const MUTED = 'rgba(255,255,255,0.42)'
const DIM = 'rgba(255,255,255,0.2)'

const FEATURES = [
  { num: '01', text: 'Written from real operator experience' },
  { num: '02', text: 'Ships across Bangladesh within 2–5 days' },
  { num: '03', text: '30-day money-back guarantee' },
]

const TICKER_ITEMS = ['BOOKS', 'VIDEO COURSES', 'DIGITAL KITS', 'E-COMMERCE', 'SALES FRAMEWORKS',
  'COMMUNICATION', 'EMERGING MARKETS', 'BUSINESS TOOLS', 'SUPPLY CHAIN', 'GROWTH PLAYBOOKS']

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetch('/api/shop/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false) })
  }, [])

  const addToCart = useCallback((p: Product) => {
    setCart(prev => prev.find(i => i.product.id === p.id) ? prev : [...prev, { product: p, quantity: 1 }])
    setCartOpen(true)
  }, [])
  const removeFromCart = useCallback((id: string) => setCart(prev => prev.filter(i => i.product.id !== id)), [])
  const cartTotal = cart.reduce((s, i) => s + i.product.price_bdt * i.quantity, 0)

  const byDomain = DOMAIN_ORDER.reduce((acc, d) => {
    const dp = products.filter(p => p.domain === d)
    if (dp.length) acc[d] = dp
    return acc
  }, {} as Record<string, Product[]>)

  const allDomains = ['All', ...DOMAIN_ORDER.filter(d => byDomain[d])]
  const filtered = activeFilter === 'All' ? Object.keys(byDomain) : [activeFilter].filter(d => byDomain[d])

  return (
    <div className="min-h-screen text-white" style={{
      backgroundColor: BG,
      backgroundImage: `linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)`,
      backgroundSize: '160px 160px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        body, * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .serif { font-family: 'Playfair Display', serif; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 40s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        .btn-yellow { background: #F5C200; color: #1a1a18; border: 2px solid #F5C200; }
        .btn-yellow:hover { opacity: 0.88; }
        .btn-outline { background: transparent; color: rgba(255,255,255,0.75); border: 2px solid rgba(255,255,255,0.25); }
        .btn-outline:hover { border-color: rgba(255,255,255,0.7); }
      `}</style>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: 'rgba(42,42,40,0.98)', borderBottom: `1px solid ${YELLOW}`, backdropFilter: 'blur(10px)' }}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex items-center justify-between h-[54px]">
          <a href="#" className="text-[18px] font-black tracking-tight leading-none" style={{ letterSpacing: '-0.02em' }}>
            Fahim<span className="serif" style={{ color: YELLOW, fontStyle: 'italic', fontWeight: 900 }}>Salam</span>
          </a>
          <button
            onClick={() => setCartOpen(true)}
            className="btn-yellow text-[11px] font-black tracking-[0.13em] uppercase px-6 py-2.5 transition-opacity"
          >
            Order Now {cart.length > 0 ? `(${cart.length})` : '→'}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-[1400px] mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" style={{ minHeight: '540px' }}>

          {/* Left column */}
          <div className="flex flex-col justify-center py-14 pr-8" style={{ borderRight: `1px solid ${BORDER}` }}>
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 mb-8 w-fit" style={{ border: `1px solid rgba(255,255,255,0.18)`, padding: '5px 12px' }}>
              <span style={{ color: YELLOW, fontSize: 10 }}>+</span>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: MUTED }}>Builder · Operator · Author</span>
            </div>

            {/* Headline */}
            <h1 className="serif font-black leading-[1.04] mb-6" style={{ fontSize: 'clamp(2.6rem, 4.5vw, 4rem)', letterSpacing: '-0.01em' }}>
              <span className="text-white">Frameworks for the<br />builders of</span><br />
              <em style={{ color: YELLOW, fontStyle: 'italic' }}>tomorrow!</em>
            </h1>

            {/* Subtitle */}
            <p className="mb-10 leading-relaxed" style={{ color: MUTED, fontSize: 14, maxWidth: 400 }}>
              Three books built from 7+ years running logistics, e-commerce,
              and supply chain businesses across Bangladesh&apos;s emerging market.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <a href="#products" className="btn-yellow text-[11px] font-black tracking-[0.12em] uppercase px-7 py-3.5 transition-opacity inline-block">
                Get the Books →
              </a>
              <a href="#products" className="btn-outline text-[11px] font-black tracking-[0.12em] uppercase px-7 py-3.5 transition-colors inline-block">
                Browse the Shelf
              </a>
            </div>

            {/* Stats — inside left column */}
            <div className="flex" style={{ borderTop: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}` }}>
              {[
                { num: '7+', label: 'Years Operating' },
                { num: '1K+', label: 'Brands Served' },
                { num: '4K+', label: 'Active Readers' },
              ].map(({ num, label }) => (
                <div key={label} className="flex-1 py-5 px-5" style={{ borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                  <div className="serif font-black mb-0.5" style={{ fontSize: 28, color: YELLOW }}>{num}</div>
                  <div className="font-bold uppercase tracking-[0.14em]" style={{ fontSize: 9, color: MUTED }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — book stack */}
          <div className="flex items-center justify-center py-10 lg:pl-8">
            <div className="relative" style={{ width: 460, height: 460 }}>

              {/* Book 3 — back right: #1 Online Brand */}
              <div className="absolute shadow-2xl overflow-hidden flex flex-col" style={{
                width: 210, height: 300, right: 0, top: 30,
                backgroundColor: '#ffffff',
                transform: 'rotate(9deg)',
                transformOrigin: 'bottom center',
              }}>
                <div style={{ backgroundColor: '#e8e8e4', padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.08em', color: '#333', textTransform: 'uppercase', lineHeight: 1.5 }}>From the author of &ldquo;Hard Markets&rdquo;!</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-3">
                  <div style={{
                    backgroundColor: '#F5C200',
                    padding: '10px 14px',
                    width: '100%',
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.15)',
                  }}>
                    <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.06em', color: '#1a1a18', textTransform: 'uppercase', marginBottom: 2 }}>How to build Bangladesh&apos;s</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#1a1a18', lineHeight: 0.9, textTransform: 'uppercase' }}>#1<br />ONLINE<br />BRAND</div>
                  </div>
                  <div style={{ fontSize: 6.5, fontWeight: 700, color: '#555', textAlign: 'center', marginTop: 8, letterSpacing: '0.04em', lineHeight: 1.5, textTransform: 'uppercase' }}>Tested strategies, killer products,<br />high margins, no excuses.</div>
                </div>
                <div style={{ padding: '6px 12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: '#1a1a18', textTransform: 'uppercase' }}>Fahim Salam</div>
                </div>
              </div>

              {/* Book 2 — middle: Talk Like A King */}
              <div className="absolute shadow-2xl overflow-hidden flex flex-col" style={{
                width: 215, height: 310, left: 85, top: 15,
                backgroundColor: '#ffffff',
                transform: 'rotate(-5deg)',
                transformOrigin: 'bottom center',
              }}>
                <div className="flex flex-col items-center justify-between h-full px-4 py-4">
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: '#C9A227', textTransform: 'uppercase', textAlign: 'center' }}>F A H I M &nbsp; S A L A M</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 52, fontWeight: 900, color: '#111', lineHeight: 0.88, letterSpacing: '-0.02em' }}>TALK</div>
                    <div style={{ fontSize: 22, fontWeight: 400, color: '#111', letterSpacing: '0.28em', margin: '4px 0', textTransform: 'uppercase' }}>LIKE A</div>
                    <div style={{ fontSize: 52, fontWeight: 900, color: '#C9A227', lineHeight: 0.88, letterSpacing: '-0.02em' }}>KING</div>
                    <div style={{ fontSize: 22, textAlign: 'center', marginTop: 2 }}>♛</div>
                  </div>
                  <div style={{ fontSize: 6.5, fontWeight: 600, color: '#555', textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.6, textTransform: 'uppercase' }}>The get-shit-done communication<br />guidebook for entrepreneurs &amp;<br />career builders!</div>
                </div>
              </div>

              {/* Book 1 — front: Hard Markets */}
              <div className="absolute shadow-2xl overflow-hidden flex flex-col" style={{
                width: 220, height: 320, left: 0, top: 0,
                backgroundColor: '#ffffff',
                transform: 'rotate(-1deg)',
                transformOrigin: 'bottom center',
              }}>
                <div style={{ backgroundColor: '#e8e8e4', padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.08em', color: '#333', textTransform: 'uppercase', lineHeight: 1.5 }}>With unfiltered insights<br />from real entrepreneurs</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-between px-3 py-3">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 54, fontWeight: 900, color: '#2a7a2a', lineHeight: 0.9, letterSpacing: '-0.02em' }}>HARD</div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: '#111', lineHeight: 0.9, letterSpacing: '-0.02em' }}>MARKETS</div>
                  </div>
                  <div style={{ fontSize: 34, textAlign: 'center', margin: '4px 0' }}>🛺</div>
                  <div style={{ fontSize: 6.5, fontWeight: 700, color: '#444', textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1.6, textTransform: 'uppercase' }}>Notes for builders, operators &amp; investors<br />of emerging markets like Bangladesh</div>
                </div>
                <div style={{ padding: '6px 12px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase' }}>Fahim Salam</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Feature strip — full width below hero */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          {FEATURES.map(({ num, text }, i) => (
            <div key={num} className="flex items-center gap-4 py-4 px-2"
              style={{ borderRight: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
              <span className="font-black flex-shrink-0" style={{ fontSize: 11, color: YELLOW }}>{num}</span>
              <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="overflow-hidden py-4" style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, backgroundColor: 'rgba(0,0,0,0.25)' }}>
        <div className="ticker-track flex whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 px-7 font-black uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', color: MUTED }}>
              {item} <span style={{ color: YELLOW }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── DOMAIN FILTER ── */}
      <div className="sticky top-[54px] z-40" id="products" style={{ backgroundColor: 'rgba(42,42,40,0.97)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(10px)' }}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex overflow-x-auto">
          {allDomains.map(d => (
            <button key={d} onClick={() => setActiveFilter(d)}
              className="flex-shrink-0 font-black uppercase transition-colors whitespace-nowrap"
              style={{
                fontSize: 10, letterSpacing: '0.12em',
                padding: '14px 20px',
                borderRight: `1px solid ${BORDER}`,
                backgroundColor: activeFilter === d ? YELLOW : 'transparent',
                color: activeFilter === d ? '#1a1a18' : MUTED,
              }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <main className="max-w-[1400px] mx-auto px-8 lg:px-16 py-20">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: YELLOW, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-20">
            {filtered.map(domain => (
              <DomainSection key={domain} domain={domain} products={byDomain[domain] || []} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            ))}
          </div>
        )}
      </main>

      {/* ── AUTHOR ── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: '#222220' }}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-20">
          <p className="font-black uppercase tracking-[0.2em] mb-4" style={{ fontSize: 10, color: YELLOW }}>— About the Author</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="serif font-black leading-tight mb-6" style={{ fontSize: 'clamp(2rem,3vw,2.8rem)' }}>Not a guru.<br />An operator.</h2>
              <p className="leading-relaxed mb-8" style={{ fontSize: 14, color: MUTED, maxWidth: 440 }}>
                7+ years building venture-backed logistics and supply chain companies in Bangladesh.
                The books aren&apos;t theory — they&apos;re what actually works when the infrastructure,
                data, and capital don&apos;t exist yet.
              </p>
              <div className="flex gap-3">
                <a href="#products" className="btn-yellow text-[11px] font-black tracking-[0.12em] uppercase px-6 py-3 transition-opacity inline-block">Order Now →</a>
                <a href="#products" className="btn-outline text-[11px] font-black tracking-[0.12em] uppercase px-6 py-3 transition-colors inline-block">Bundle &amp; Save</a>
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ border: `1px solid ${BORDER}` }}>
              {[
                { num: '7+', label: 'Years in Emerging Market Operations' },
                { num: '1K+', label: 'E-Commerce Brands Served' },
                { num: '4K+', label: 'Monthly Active Platform Users' },
                { num: '2', label: 'Flagship Books in the Market' },
              ].map(({ num, label }) => (
                <div key={label} className="p-6" style={{ borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                  <div className="serif font-black mb-1" style={{ fontSize: 28, color: YELLOW }}>{num}</div>
                  <div className="font-bold uppercase tracking-[0.12em] leading-relaxed" style={{ fontSize: 9, color: MUTED }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: '#1c1c1a', padding: '28px 0' }}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-base tracking-tight">
            Fahim<span className="serif" style={{ color: YELLOW, fontStyle: 'italic' }}>Salam</span>
          </span>
          <div className="flex gap-8 font-bold uppercase tracking-[0.12em]" style={{ fontSize: 10, color: MUTED }}>
            <a href="#products" className="hover:text-white transition-colors">Books</a>
            <a href="#products" className="hover:text-white transition-colors">Courses</a>
            <a href="#products" className="hover:text-white transition-colors">Kits</a>
            <Link href="/portal/login" className="hover:text-white transition-colors">My Account</Link>
          </div>
          <span style={{ fontSize: 11, color: DIM }}>© {new Date().getFullYear()} Fahim Salam. All rights reserved.</span>
        </div>
      </footer>

      {cartOpen && <CartSidebar cart={cart} total={cartTotal} onRemove={removeFromCart} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

function DomainSection({ domain, products, cart, onAdd, onRemove }: {
  domain: string; products: Product[]; cart: CartItem[]
  onAdd: (p: Product) => void; onRemove: (id: string) => void
}) {
  const hasBooks = products.some(p => p.item_type === 'Physical Book')
  const hasCourses = products.some(p => p.item_type === 'Video Course')
  return (
    <section>
      <div className="flex items-baseline gap-6 mb-8">
        <h2 className="serif font-black text-white" style={{ fontSize: 22 }}>{domain}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
        <span className="font-bold uppercase tracking-widest" style={{ fontSize: 9, color: MUTED }}>{products.length} items</span>
      </div>
      {hasBooks ? (
        <div style={{ border: `1px solid ${BORDER}` }}>
          {products.map((p, i) => <BookRow key={p.id} product={p} vol={i + 1} inCart={cart.some(c => c.product.id === p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />)}
        </div>
      ) : hasCourses ? (
        <div style={{ border: `1px solid ${BORDER}` }}>
          {products.map(p => <CourseRow key={p.id} product={p} domain={domain} inCart={cart.some(c => c.product.id === p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ border: `1px solid ${BORDER}` }}>
          {products.map(p => <KitCard key={p.id} product={p} inCart={cart.some(c => c.product.id === p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />)}
        </div>
      )}
    </section>
  )
}

function BookRow({ product, vol, inCart, onAdd, onRemove }: { product: Product; vol: number; inCart: boolean; onAdd: () => void; onRemove: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: inCart ? 'rgba(245,194,0,0.04)' : CARD }}>
      <div className="flex-shrink-0 flex flex-col items-center justify-center" style={{ width: 44, height: 44, border: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.15em', color: MUTED, textTransform: 'uppercase' }}>Vol</span>
        <span className="serif font-black leading-none" style={{ fontSize: 16, color: YELLOW }}>{String(vol).padStart(2, '0')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', marginBottom: 3 }}>Physical Book</p>
        <h3 className="serif font-black text-white" style={{ fontSize: 17 }}>{product.name}</h3>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="serif font-black" style={{ fontSize: 22, color: YELLOW }}>{product.is_free ? 'FREE' : formatBDT(product.price_bdt)}</span>
        {inCart
          ? <button onClick={onRemove} className="btn-outline font-black uppercase transition-colors" style={{ fontSize: 10, letterSpacing: '0.1em', padding: '10px 18px' }}>Remove ✕</button>
          : <button onClick={onAdd} className="btn-yellow font-black uppercase transition-opacity" style={{ fontSize: 10, letterSpacing: '0.1em', padding: '10px 18px' }}>Order →</button>}
      </div>
    </div>
  )
}

function CourseRow({ product, domain, inCart, onAdd, onRemove }: { product: Product; domain: string; inCart: boolean; onAdd: () => void; onRemove: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: inCart ? 'rgba(245,194,0,0.04)' : CARD }}>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', marginBottom: 3 }}>{domain} · Video Course</p>
        <h3 className="serif font-black text-white" style={{ fontSize: 17 }}>{product.name}</h3>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <span className="serif font-black block" style={{ fontSize: 22, color: YELLOW }}>{product.is_free ? 'FREE' : formatBDT(product.price_bdt)}</span>
          {!product.is_free && <span style={{ fontSize: 10, color: MUTED }}>/ lifetime</span>}
        </div>
        {inCart
          ? <button onClick={onRemove} className="btn-outline font-black uppercase transition-colors" style={{ fontSize: 10, letterSpacing: '0.1em', padding: '10px 18px' }}>Remove ✕</button>
          : <button onClick={onAdd} className="btn-yellow font-black uppercase transition-opacity" style={{ fontSize: 10, letterSpacing: '0.1em', padding: '10px 18px' }}>Enroll →</button>}
      </div>
    </div>
  )
}

function KitCard({ product, inCart, onAdd, onRemove }: { product: Product; inCart: boolean; onAdd: () => void; onRemove: () => void }) {
  const icon = ITEM_TYPE_ICONS[product.item_type] || '📦'
  return (
    <div className="flex flex-col gap-5 p-6" style={{ borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, backgroundColor: inCart ? 'rgba(245,194,0,0.04)' : CARD }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div className="flex-1">
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: MUTED, textTransform: 'uppercase', marginBottom: 6 }}>{product.item_type}</p>
        <h3 className="serif font-black text-white leading-snug" style={{ fontSize: 15 }}>{product.name}</h3>
      </div>
      <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <span className="serif font-black" style={{ fontSize: 20, color: YELLOW }}>{product.is_free ? 'FREE' : formatBDT(product.price_bdt)}</span>
        {inCart
          ? <button onClick={onRemove} className="btn-outline font-black uppercase" style={{ fontSize: 10, letterSpacing: '0.1em', padding: '8px 14px' }}>Remove ✕</button>
          : <button onClick={onAdd} className="btn-yellow font-black uppercase" style={{ fontSize: 10, letterSpacing: '0.1em', padding: '8px 14px' }}>Get Kit →</button>}
      </div>
    </div>
  )
}

function CartSidebar({ cart, total, onRemove, onClose }: { cart: CartItem[]; total: number; onRemove: (id: string) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col" style={{ backgroundColor: '#1e1e1c', borderLeft: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <h2 className="font-black" style={{ fontSize: 15 }}>Your Cart <span style={{ color: YELLOW }}>({cart.length})</span></h2>
          <button onClick={onClose} style={{ color: MUTED }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: MUTED }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p style={{ fontSize: 13, fontWeight: 700 }}>Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="flex gap-4 px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', color: MUTED, textTransform: 'uppercase', marginBottom: 3 }}>{item.product.item_type}</p>
                <p className="text-white font-bold leading-snug line-clamp-2" style={{ fontSize: 13 }}>{item.product.name}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="serif font-black" style={{ fontSize: 14, color: YELLOW }}>{item.product.is_free ? 'FREE' : formatBDT(item.product.price_bdt)}</span>
                <button onClick={() => onRemove(item.product.id)} style={{ color: DIM }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-6 space-y-4" style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-[0.15em]" style={{ fontSize: 10, color: MUTED }}>Total</span>
              <span className="serif font-black" style={{ fontSize: 24, color: YELLOW }}>{formatBDT(total)}</span>
            </div>
            <Link href={`/shop/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))))}`}
              className="btn-yellow block w-full text-center font-black uppercase transition-opacity"
              style={{ fontSize: 11, letterSpacing: '0.12em', padding: '16px' }}>
              Proceed to Checkout →
            </Link>
            <p className="text-center" style={{ fontSize: 11, color: DIM }}>Payment via bKash · Bank transfer · Cash</p>
          </div>
        )}
      </div>
    </>
  )
}
