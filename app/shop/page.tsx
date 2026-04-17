'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Product, CartItem } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_COLORS, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

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
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev
      return [...prev, { product, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price_bdt * i.quantity, 0)
  const cartCount = cart.length

  const productsByDomain = DOMAIN_ORDER.reduce((acc, domain) => {
    const domainProducts = products.filter(p => p.domain === domain)
    if (domainProducts.length > 0) acc[domain] = domainProducts
    return acc
  }, {} as Record<string, Product[]>)

  const allDomains = ['All', ...DOMAIN_ORDER.filter(d => productsByDomain[d])]
  const filteredDomains = activeFilter === 'All'
    ? Object.keys(productsByDomain)
    : [activeFilter].filter(d => productsByDomain[d])

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10" style={{ backgroundColor: 'rgba(51,51,51,0.97)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
              <span className="font-bold text-lg tracking-tight text-white">Lucius</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <a href="#products" className="hover:text-white transition-colors">Products</a>
              <Link href="/portal/login" className="hover:text-white transition-colors">My Courses</Link>
            </nav>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg transition-colors text-[#333]"
              style={{ backgroundColor: '#F5C200' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7D040')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F5C200')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2878B5] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #333333 0%, #3d3d3d 50%, #404040 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(245,194,0,0.08) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(40,120,181,0.06) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider border" style={{ backgroundColor: 'rgba(245,194,0,0.12)', borderColor: 'rgba(245,194,0,0.3)', color: '#F5C200' }}>
            Books · Courses · Digital Tools
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight text-white">
            Knowledge that moves<br />
            <span style={{ color: '#F5C200' }}>Bangladesh forward</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Business books, video courses, digital toolkits, and one-on-one coaching—built for Bangladeshi founders, brands, and professionals.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
            style={{ backgroundColor: '#F5C200', color: '#333333' }}
          >
            Browse Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Domain Filter */}
      <section className="sticky top-16 z-40 backdrop-blur border-b border-white/10" id="products" style={{ backgroundColor: 'rgba(51,51,51,0.97)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {allDomains.map(domain => (
              <button
                key={domain}
                onClick={() => setActiveFilter(domain)}
                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                style={activeFilter === domain
                  ? { backgroundColor: '#F5C200', color: '#333333' }
                  : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
                }
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-16">
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

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 px-4" style={{ backgroundColor: '#333333' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center font-black text-white text-xs" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
            <span>Lucius © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/portal/login" className="hover:text-white transition-colors">Customer Portal</Link>
            <a href="mailto:support@lucius.com.bd" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
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
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#F5C200' }} />
        <h2 className="text-xl font-bold tracking-tight text-white">{domain}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{products.length} items</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
  const colorClass = ITEM_TYPE_COLORS[product.item_type] || 'bg-white/10 text-white/60 border border-white/20'

  return (
    <div
      className="group flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200 border"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: inCart ? '#F5C200' : 'rgba(255,255,255,0.1)' }}
    >
      {/* Type badge */}
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${colorClass}`}>
          <span>{icon}</span>
          {product.item_type}
        </span>
        {product.is_free && (
          <span className="text-xs font-bold px-2 py-1 rounded-lg border" style={{ backgroundColor: 'rgba(40,120,181,0.12)', color: '#5BA3D9', borderColor: 'rgba(40,120,181,0.3)' }}>
            FREE
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm leading-snug flex-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {product.name}
      </h3>

      {/* Price + CTA */}
      <div className="flex items-center justify-between gap-3 mt-auto">
        <div className="font-black text-lg">
          {product.is_free ? (
            <span style={{ color: '#5BA3D9' }}>FREE</span>
          ) : (
            <span style={{ color: '#F5C200' }}>{formatBDT(product.price_bdt)}</span>
          )}
        </div>
        {inCart ? (
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'rgba(217,120,40,0.12)', border: '1px solid rgba(217,120,40,0.35)', color: '#E89040' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#F5C200', color: '#333333' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Cart
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
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col border-l border-white/10" style={{ backgroundColor: '#333333' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-bold text-lg text-white">Your Cart ({cart.length})</h2>
          <button onClick={onClose} className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.product.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.product.item_type}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                  <span className="font-bold text-sm" style={{ color: '#F5C200' }}>
                    {item.product.is_free ? 'FREE' : formatBDT(item.product.price_bdt)}
                  </span>
                  <button onClick={() => onRemove(item.product.id)} style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total</span>
              <span className="font-black text-xl" style={{ color: '#F5C200' }}>{formatBDT(total)}</span>
            </div>
            <Link
              href={`/shop/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))))}`}
              className="block w-full font-bold text-center py-3.5 rounded-xl transition-colors text-sm"
              style={{ backgroundColor: '#F5C200', color: '#333333' }}
            >
              Proceed to Checkout →
            </Link>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Payment via bKash, bank transfer, or cash
            </p>
          </div>
        )}
      </div>
    </>
  )
}
