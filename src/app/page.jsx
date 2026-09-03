'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import { getProducts } from '@/api/products';
import { getPublishedCampaigns } from '@/api/campaigns';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';

const categories = [
  {
    title: 'Normal / Heart Shape',
    description: 'Perfect for gifting and celebrations',
    emoji: '🍫',
    query: 'Normal Shape or Heart',
    bg: 'from-choco-800 to-choco-900',
  },
  {
    title: 'Bites',
    description: 'Bite-sized pieces — great for bulk orders',
    emoji: '🍬',
    query: 'Bites',
    bg: 'from-choco-700 to-choco-800',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: true })
      .then((res) => setFeaturedProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center overflow-hidden bg-choco-gradient py-12 sm:py-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-choco-700/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-gold-500/20 blur-3xl" />
        </div>

        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/20 border border-gold-500/30 rounded-full text-gold-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                🍫 Handcrafted with Love
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold text-cream leading-tight mb-4 sm:mb-6">
                Made with Heart,
                <br />
                <span className="text-gold-400">Meant to</span>
                <br />
                Be Shared.
              </h1>
              <p className="text-choco-200 text-sm sm:text-lg max-w-xl mb-6 sm:mb-8 leading-relaxed font-light">
                Discover exquisite homemade chocolates for every celebration. Customized designs, gourmet flavors, and unforgettable moments.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <Link
                  href="/products"
                  id="hero-shop-now-btn"
                  className="btn-gold py-3.5 px-6 sm:px-8 text-sm sm:text-base font-bold shadow-gold text-center hover:scale-105 transition-transform"
                >
                  Shop Catalog →
                </Link>
                <Link
                  href="/customize"
                  id="hero-customize-btn"
                  className="btn-secondary py-3.5 px-6 sm:px-8 text-sm sm:text-base font-semibold border-white/20 text-cream text-center hover:bg-white/10"
                >
                  Custom Request ✨
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-choco-700/50">
                <div>
                  <p className="font-display text-xl sm:text-3xl font-bold text-gold-400">100%</p>
                  <p className="text-[10px] sm:text-xs text-choco-300">Homemade & Fresh</p>
                </div>
                <div>
                  <p className="font-display text-xl sm:text-3xl font-bold text-gold-400">2+</p>
                  <p className="text-[10px] sm:text-xs text-choco-300">Shape Categories</p>
                </div>
                <div>
                  <p className="font-display text-xl sm:text-3xl font-bold text-gold-400">Custom</p>
                  <p className="text-[10px] sm:text-xs text-choco-300">Orders Welcome</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto max-w-md">
                <div className="bg-choco-800/80 backdrop-blur-xl border border-choco-700/60 rounded-3xl p-8 shadow-choco-lg">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl">🎁</span>
                    <span className="bg-gold-500/20 text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Best Sellers
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-cream mb-2">
                    Heart Shape Chocolates
                  </h3>
                  <p className="text-choco-300 text-sm mb-6">
                    Rich, smooth, handcrafted chocolates made to celebrate your special moments.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-choco-200">
                      <span className="text-gold-400">✓</span> Custom name printing
                    </div>
                    <div className="flex items-center gap-3 text-sm text-choco-200">
                      <span className="text-gold-400">✓</span> Gift wrapping included
                    </div>
                    <div className="flex items-center gap-3 text-sm text-choco-200">
                      <span className="text-gold-400">✓</span> Freshly made on order
                    </div>
                  </div>

                  <a
                    href={buildWhatsAppUrl('Hi! I would like to order Heart Shape Chocolates.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold w-full text-center py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>💬 Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Tiles */}
      <section className="py-12 sm:py-20 bg-cream">
        <div className="page-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-choco-900">Shop by Category</h2>
            <p className="text-choco-600 text-xs sm:text-lg mt-1">Two wonderful collections to choose from</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.query)}`}
                  id={`category-${cat.query.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`block bg-gradient-to-br ${cat.bg} rounded-3xl p-6 sm:p-8 text-center hover:shadow-choco-lg transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <span className="text-4xl sm:text-6xl mb-3 sm:mb-4 block group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-cream mb-1 sm:mb-2">{cat.title}</h3>
                  <p className="text-choco-200 text-xs sm:text-sm">{cat.description}</p>
                  <span className="inline-block mt-3 sm:mt-4 text-gold-400 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="page-container">
          <div className="flex flex-row items-center justify-between mb-8 sm:mb-12 gap-2">
            <div>
              <h2 className="text-xl sm:text-4xl font-display font-bold text-choco-900">Featured Creations</h2>
              <p className="text-choco-600 text-xs sm:text-base mt-0.5">Popular handcrafted chocolates</p>
            </div>
            <Link
              href="/products"
              id="view-all-products-btn"
              className="text-choco-800 font-semibold hover:text-choco-600 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"
            >
              View All <span className="hidden sm:inline">Products</span> →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-12 sm:py-16 bg-choco-gradient text-cream relative overflow-hidden">
        <div className="page-container text-center relative z-10">
          <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">💬</span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            Need a Custom Chocolate Box?
          </h2>
          <p className="text-choco-200 max-w-xl mx-auto mb-6 sm:mb-8 text-xs sm:text-lg font-light">
            Chat with us directly on WhatsApp for bulk orders, event favors, or special customized designs.
          </p>
          <a
            href={buildWhatsAppUrl("Hi! I'd like to ask about a custom chocolate order.")}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-cta-btn"
            className="btn-gold py-3.5 px-6 sm:px-10 text-xs sm:text-base font-bold inline-flex items-center gap-2 sm:gap-3 shadow-gold hover:scale-105 transition-transform"
          >
            <span>💬 Chat on WhatsApp Now</span>
          </a>
        </div>
      </section>
    </div>
  );
}
