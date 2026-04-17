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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-sm">L</div>
              <span className="font-bold text-lg tracking-tight">Lucius</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
              <a href="#products" className="hover:text-white transition-colors">Products</a>
              <Link href="/portal/login" className="hover:text-white transition-colors">My Courses</Link>
            </nav>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-orange-500/5" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Books · Courses · Digital Tools
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Knowledge that moves<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Bangladesh forward</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Business books, video courses, digital toolkits, and one-on-one coaching—built for Bangladeshi founders, brands, and professionals.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
          >
            Browse Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Domain Filter */}
      <section className="sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {allDomains.map(domain => (
              <button
                key={domain}
                onClick={() => setActiveFilter(domain)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === domain
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
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
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
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
      <footer className="border-t border-white/10 mt-20 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs">L</div>
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
        <h2 className="text-xl font-bold tracking-tight">{domain}</h2>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs font-medium">{products.length} items</span>
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
  const colorClass = ITEM_TYPE_COLORS[product.item_type] || 'bg-gray-100 text-gray-800'

  return (
    <div className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200">
      {/* Type badge */}
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${colorClass}`}>
          <span>{icon}</span>
          {product.item_type}
        </span>
        {product.is_free && (
          <span className="bg-green-400/10 text-green-400 text-xs font-bold px-2 py-1 rounded-lg border border-green-400/20">
            FREE
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm leading-snug text-white/90 flex-1">
        {product.name}
      </h3>

      {/* Price + CTA */}
      <div className="flex items-center justify-between gap-3 mt-auto">
        <div className="font-black text-lg">
          {product.is_free ? (
            <span className="text-green-400">FREE</span>
          ) : (
            <span className="text-amber-400">{formatBDT(product.price_bdt)}</span>
          )}
        </div>
        {inCart ? (
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#111] border-l border-white/10 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-bold text-lg">Your Cart ({cart.length})</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 bg-white/5 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-white/40 mt-1">{item.product.item_type}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                  <span className="font-bold text-amber-400 text-sm">
                    {item.product.is_free ? 'FREE' : formatBDT(item.product.price_bdt)}
                  </span>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
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
              <span className="text-white/60">Total</span>
              <span className="font-black text-xl text-amber-400">{formatBDT(total)}</span>
            </div>
            <Link
              href={`/shop/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))))}`}
              className="block w-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-center py-3.5 rounded-xl transition-colors"
            >
              Proceed to Checkout →
            </Link>
            <p className="text-center text-white/30 text-xs">
              Payment via bKash, bank transfer, or cash
            </p>
          </div>
        )}
      </div>
    </>
  )
}
