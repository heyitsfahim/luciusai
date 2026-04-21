'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Product, CartItem } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

const BG = '#2e2e2c'
const CARD = '#383836'
const BORDER = 'rgba(255,255,255,0.07)'
const YELLOW = '#F5C200'
const MUTED = 'rgba(255,255,255,0.45)'
const DIM = 'rgba(255,255,255,0.18)'

const GRID_STYLE = {
  backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`,
  backgroundSize: '80px 80px',
}

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
    <div className="min-h-screen text-white" style={{ backgroundColor: BG, ...GRID_STYLE }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Playfair Display', serif; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 35s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(46,46,44,0.97)', borderColor: BORDER, backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-[56px]">
          <a href="#" className="text-[17px] font-black tracking-tight">
            Lucius<span style={{ color: YELLOW }}>AI</span>
          </a>
          <button
            onClick={() => setCartOpen(true)}
            className="text-[11px] font-black tracking-[0.12em] uppercase px-5 py-2.5 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: YELLOW, color: '#1a1a18' }}
          >
            Order Now {cart.length > 0 ? `(${cart.length})` : '→'}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[520px]">
          {/* Left */}
          <div className="py-10">
            <div className="inline-flex items-center gap-2 mb-8 text-[10px] font-bold tracking-[0.2em] uppercase border px-3 py-1.5" style={{ borderColor: 'rgba(245,194,0,0.4)', color: YELLOW }}>
              <span>·</span> Builder <span>·</span> Operator <span>·</span> Author
            </div>
            <h1 className="serif text-5xl lg:text-[4.2rem] font-black leading-[1.06] mb-7 tracking-tight text-white">
              Frameworks for the<br />builders of<br />
              <em style={{ color: YELLOW, fontStyle: 'italic' }}>tomorrow!</em>
            </h1>
            <p className="text-[15px] leading-relaxed mb-10 max-w-[420px]" style={{ color: MUTED }}>
              Books, courses, and digital toolkits built from 7+ years running logistics,
              e-commerce, and supply chain businesses across Bangladesh&apos;s emerging market.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#products" className="text-[11px] font-black tracking-[0.1em] uppercase px-7 py-3.5 hover:opacity-90 transition-opacity" style={{ backgroundColor: YELLOW, color: '#1a1a18' }}>
                Get the Books →
              </a>
              <a href="#products" className="text-[11px] font-black tracking-[0.1em] uppercase px-7 py-3.5 border hover:border-white transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.65)' }}>
                Browse the Shelf
              </a>
            </div>
          </div>

          {/* Right — book stack visual */}
          <div className="hidden lg:flex items-center justify-center py-10 relative h-[440px]">
            <div className="relative w-[400px] h-[380px]">
              {/* Book 3 — back */}
              <div className="absolute top-6 right-0 w-[180px] h-[250px] shadow-2xl flex flex-col justify-between p-5" style={{ backgroundColor: '#F5C200', transform: 'rotate(8deg)', transformOrigin: 'bottom center' }}>
                <div className="text-[9px] font-black tracking-[0.2em] uppercase text-black/50">Lucius AI</div>
                <div>
                  <div className="text-3xl font-black leading-none text-black mb-1">#1<br />ONLINE<br />BRAND</div>
                  <div className="text-[8px] font-black tracking-widest uppercase text-black/60 mt-2">Build Bangladesh's Leading Brand</div>
                </div>
                <div className="text-[10px] font-black tracking-wider uppercase text-black/70">Lucius AI</div>
              </div>
              {/* Book 2 — middle */}
              <div className="absolute top-2 left-16 w-[180px] h-[260px] shadow-2xl flex flex-col justify-between p-5" style={{ backgroundColor: '#1a1a18', border: '1px solid rgba(255,255,255,0.15)', transform: 'rotate(-4deg)', transformOrigin: 'bottom center' }}>
                <div className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: MUTED }}>Lucius AI</div>
                <div>
                  <div className="text-3xl font-black leading-none text-white mb-1">TALK<br />LIKE A<br /><span style={{ color: YELLOW }}>KING</span></div>
                  <div className="text-[8px] font-black tracking-widest uppercase mt-2" style={{ color: MUTED }}>Communication Masterclass</div>
                </div>
                <div className="text-[10px] font-black tracking-wider uppercase" style={{ color: DIM }}>Lucius AI</div>
              </div>
              {/* Book 1 — front */}
              <div className="absolute top-0 left-0 w-[190px] h-[270px] shadow-2xl flex flex-col justify-between p-5" style={{ backgroundColor: '#f0f0ec', transform: 'rotate(-1deg)', transformOrigin: 'bottom center' }}>
                <div className="text-[9px] font-black tracking-[0.2em] uppercase text-black/40">Lucius AI</div>
                <div>
                  <div className="text-4xl font-black leading-none text-black mb-2">HARD<br /><span style={{ color: '#2a7a2a' }}>MARKETS</span></div>
                  <div className="text-[7px] font-black tracking-widest uppercase text-black/50 leading-relaxed">Notes for builders, operators &amp; investors of emerging markets</div>
                </div>
                <div className="text-[10px] font-black tracking-wider uppercase text-black/50">Lucius AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-3 border-t border-l" style={{ borderColor: BORDER }}>
          {[
            { num: '7+', label: 'Years Operating' },
            { num: '1K+', label: 'Brands Served' },
            { num: '4K+', label: 'Active Readers' },
          ].map(({ num, label }) => (
            <div key={label} className="px-8 py-7 border-r border-b" style={{ borderColor: BORDER }}>
              <div className="text-3xl font-black mb-1" style={{ color: YELLOW }}>{num}</div>
              <div className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>

        {/* FEATURE STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-l" style={{ borderColor: BORDER }}>
          {FEATURES.map(({ num, text }) => (
            <div key={num} className="flex items-center gap-4 px-6 py-4 border-r border-b" style={{ borderColor: BORDER }}>
              <span className="text-[11px] font-black flex-shrink-0" style={{ color: YELLOW }}>{num}</span>
              <span className="text-[12px] font-medium" style={{ color: MUTED }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden border-y mt-0 py-4" style={{ borderColor: BORDER, backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div className="ticker-track flex whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 px-6 text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: MUTED }}>
              {item} <span style={{ color: YELLOW }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* FILTER */}
      <div className="sticky top-[56px] z-40 border-b" id="products" style={{ backgroundColor: 'rgba(46,46,44,0.97)', borderColor: BORDER, backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex overflow-x-auto">
          {allDomains.map(d => (
            <button
              key={d}
              onClick={() => setActiveFilter(d)}
              className="flex-shrink-0 text-[10px] font-black tracking-[0.1em] uppercase px-5 py-3.5 border-r whitespace-nowrap transition-colors"
              style={{
                borderColor: BORDER,
                backgroundColor: activeFilter === d ? YELLOW : 'transparent',
                color: activeFilter === d ? '#1a1a18' : MUTED,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: YELLOW, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-24">
            {filtered.map(domain => (
              <DomainSection
                key={domain}
                domain={domain}
                products={byDomain[domain] || []}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* AUTHOR */}
      <section className="border-t" style={{ borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: YELLOW }}>— About the Author</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="serif text-4xl font-black mb-6 leading-tight">Not a guru.<br />An operator.</h2>
              <p className="text-[15px] leading-relaxed mb-8" style={{ color: MUTED }}>
                7+ years building venture-backed logistics and supply chain companies in Bangladesh.
                The books aren&apos;t theory — they&apos;re what actually works when the infrastructure,
                data, and capital don&apos;t exist yet.
              </p>
              <div className="flex gap-3">
                <a href="#products" className="text-[11px] font-black tracking-[0.1em] uppercase px-6 py-3 hover:opacity-90" style={{ backgroundColor: YELLOW, color: '#1a1a18' }}>
                  Order Now →
                </a>
                <a href="#products" className="text-[11px] font-black tracking-[0.1em] uppercase px-6 py-3 border hover:border-white transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)', color: MUTED }}>
                  Bundle &amp; Save
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 border-l border-t" style={{ borderColor: BORDER }}>
              {[
                { num: '7+', label: 'Years in Emerging Market Operations' },
                { num: '1K+', label: 'E-Commerce Brands Served' },
                { num: '4K+', label: 'Monthly Active Platform Users' },
                { num: '2', label: 'Flagship Books in the Market' },
              ].map(({ num, label }) => (
                <div key={label} className="p-7 border-r border-b" style={{ borderColor: BORDER }}>
                  <div className="text-3xl font-black mb-2" style={{ color: YELLOW }}>{num}</div>
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase leading-relaxed" style={{ color: MUTED }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8" style={{ backgroundColor: '#242422', borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-base tracking-tight">Lucius<span style={{ color: YELLOW }}>AI</span></span>
          <div className="flex gap-8 text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: MUTED }}>
            <a href="#products" className="hover:text-white transition-colors">Books</a>
            <a href="#products" className="hover:text-white transition-colors">Courses</a>
            <a href="#products" className="hover:text-white transition-colors">Kits</a>
            <Link href="/portal/login" className="hover:text-white transition-colors">My Account</Link>
          </div>
          <span className="text-[11px]" style={{ color: DIM }}>© {new Date().getFullYear()} Lucius AI. All rights reserved.</span>
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
      <div className="flex items-baseline gap-6 mb-10">
        <div>
          <h2 className="serif text-2xl font-black tracking-tight text-white">{domain}</h2>
          <p className="text-[11px] mt-1 font-bold uppercase tracking-widest" style={{ color: MUTED }}>{products.length} items</p>
        </div>
        <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
      </div>

      {hasBooks ? (
        <div className="border" style={{ borderColor: BORDER }}>
          {products.map((p, i) => <BookRow key={p.id} product={p} vol={i + 1} inCart={cart.some(c => c.product.id === p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />)}
        </div>
      ) : hasCourses ? (
        <div className="border" style={{ borderColor: BORDER }}>
          {products.map(p => <CourseRow key={p.id} product={p} domain={domain} inCart={cart.some(c => c.product.id === p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border" style={{ borderColor: BORDER }}>
          {products.map(p => <KitCard key={p.id} product={p} inCart={cart.some(c => c.product.id === p.id)} onAdd={() => onAdd(p)} onRemove={() => onRemove(p.id)} />)}
        </div>
      )}
    </section>
  )
}

function BookRow({ product, vol, inCart, onAdd, onRemove }: { product: Product; vol: number; inCart: boolean; onAdd: () => void; onRemove: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-7 border-b last:border-b-0 transition-colors" style={{ borderColor: BORDER, backgroundColor: inCart ? 'rgba(245,194,0,0.04)' : CARD }}>
      <div className="w-12 h-12 flex flex-col items-center justify-center border flex-shrink-0" style={{ borderColor: BORDER }}>
        <span className="text-[8px] font-black tracking-widest uppercase" style={{ color: MUTED }}>Vol</span>
        <span className="text-lg font-black leading-none" style={{ color: YELLOW }}>{String(vol).padStart(2, '0')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: MUTED }}>Physical Book</p>
        <h3 className="serif text-lg font-black text-white">{product.name}</h3>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">
        <span className="serif text-2xl font-black" style={{ color: YELLOW }}>{product.is_free ? 'FREE' : formatBDT(product.price_bdt)}</span>
        {inCart
          ? <button onClick={onRemove} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 border" style={{ borderColor: 'rgba(245,194,0,0.4)', color: YELLOW }}>Remove ✕</button>
          : <button onClick={onAdd} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 hover:opacity-90" style={{ backgroundColor: YELLOW, color: '#1a1a18' }}>Order →</button>}
      </div>
    </div>
  )
}

function CourseRow({ product, domain, inCart, onAdd, onRemove }: { product: Product; domain: string; inCart: boolean; onAdd: () => void; onRemove: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-7 border-b last:border-b-0 transition-colors" style={{ borderColor: BORDER, backgroundColor: inCart ? 'rgba(245,194,0,0.04)' : CARD }}>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: MUTED }}>{domain} · Video Course</p>
        <h3 className="serif text-lg font-black text-white">{product.name}</h3>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-right">
          <span className="serif text-2xl font-black block" style={{ color: YELLOW }}>{product.is_free ? 'FREE' : formatBDT(product.price_bdt)}</span>
          {!product.is_free && <span className="text-[10px]" style={{ color: MUTED }}>/ lifetime</span>}
        </div>
        {inCart
          ? <button onClick={onRemove} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 border" style={{ borderColor: 'rgba(245,194,0,0.4)', color: YELLOW }}>Remove ✕</button>
          : <button onClick={onAdd} className="text-[10px] font-black tracking-[0.1em] uppercase px-5 py-2.5 hover:opacity-90" style={{ backgroundColor: YELLOW, color: '#1a1a18' }}>Enroll →</button>}
      </div>
    </div>
  )
}

function KitCard({ product, inCart, onAdd, onRemove }: { product: Product; inCart: boolean; onAdd: () => void; onRemove: () => void }) {
  const icon = ITEM_TYPE_ICONS[product.item_type] || '📦'
  return (
    <div className="flex flex-col gap-5 p-7 border-r border-b last:border-r-0 transition-colors" style={{ borderColor: BORDER, backgroundColor: inCart ? 'rgba(245,194,0,0.04)' : CARD }}>
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <p className="text-[9px] font-black tracking-[0.18em] uppercase mb-2" style={{ color: MUTED }}>{product.item_type}</p>
        <h3 className="serif font-black text-white leading-snug">{product.name}</h3>
      </div>
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: BORDER }}>
        <span className="serif text-xl font-black" style={{ color: YELLOW }}>{product.is_free ? 'FREE' : formatBDT(product.price_bdt)}</span>
        {inCart
          ? <button onClick={onRemove} className="text-[10px] font-black tracking-[0.1em] uppercase px-4 py-2 border" style={{ borderColor: 'rgba(245,194,0,0.4)', color: YELLOW }}>Remove ✕</button>
          : <button onClick={onAdd} className="text-[10px] font-black tracking-[0.1em] uppercase px-4 py-2 hover:opacity-90" style={{ backgroundColor: YELLOW, color: '#1a1a18' }}>Get Kit →</button>}
      </div>
    </div>
  )
}

function CartSidebar({ cart, total, onRemove, onClose }: { cart: CartItem[]; total: number; onRemove: (id: string) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col border-l" style={{ backgroundColor: '#242422', borderColor: BORDER }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: BORDER }}>
          <h2 className="font-black text-base">Your Cart <span style={{ color: YELLOW }}>({cart.length})</span></h2>
          <button onClick={onClose} style={{ color: MUTED }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: MUTED }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p className="text-sm font-bold">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="flex gap-4 px-6 py-4 border-b" style={{ borderColor: BORDER }}>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black tracking-[0.15em] uppercase mb-1" style={{ color: MUTED }}>{item.product.item_type}</p>
                <p className="text-sm font-bold text-white line-clamp-2">{item.product.name}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-black text-sm" style={{ color: YELLOW }}>{item.product.is_free ? 'FREE' : formatBDT(item.product.price_bdt)}</span>
                <button onClick={() => onRemove(item.product.id)} style={{ color: DIM }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t space-y-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: MUTED }}>Total</span>
              <span className="serif font-black text-2xl" style={{ color: YELLOW }}>{formatBDT(total)}</span>
            </div>
            <Link href={`/shop/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))))}`}
              className="block w-full font-black text-center py-4 text-[11px] tracking-[0.12em] uppercase hover:opacity-90 transition-opacity"
              style={{ backgroundColor: YELLOW, color: '#1a1a18' }}>
              Proceed to Checkout →
            </Link>
            <p className="text-center text-[11px]" style={{ color: DIM }}>Payment via bKash · Bank transfer · Cash</p>
          </div>
        )}
      </div>
    </>
  )
}
