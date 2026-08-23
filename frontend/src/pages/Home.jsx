import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { getImageUrl } from '../utils/imageUrl';
import { getProducts } from '../api/products';
import { getPublishedCampaigns, getUpcomingCampaigns } from '../api/campaigns';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';

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

const getCountdownText = (startDateStr) => {
  if (!startDateStr) return 'Coming Soon';
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Starting Soon';
  if (diffDays === 1) return 'Coming Tomorrow';
  if (diffDays < 7) return `Coming in ${diffDays} days`;
  if (diffDays >= 7 && diffDays <= 13) return 'Coming next week';
  return 'Coming this month';
};

const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: true, limit: 6 })
      .then((res) => setFeaturedProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    getPublishedCampaigns()
      .then((res) => setActiveCampaigns(res.data.campaigns || []))
      .catch(() => {});

    getUpcomingCampaigns()
      .then((res) => setUpcomingCampaigns(res.data.campaigns || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ─── Hero Banner ───────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-choco-gradient">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-choco-700/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gold-500/20 blur-3xl" />
        </div>

        <div className="page-container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-full text-gold-400 text-sm font-medium mb-6">
                🍫 Handcrafted with Love
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
                Made with Heart,
                <br />
                <span className="text-gold-400">Meant to</span>
                <br />
                Be Shared.
              </h1>
              <p className="text-choco-200 text-lg sm:text-xl max-w-xl mb-8 leading-relaxed font-light">
                Discover exquisite homemade chocolates for every celebration. Customized designs, gourmet flavors, and unforgettable moments.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  to="/products"
                  id="hero-shop-now-btn"
                  className="btn-gold py-4 px-8 text-base font-bold shadow-gold hover:scale-105 transition-transform"
                >
                  Shop Catalog →
                </Link>
                <Link
                  to="/customize"
                  id="hero-customize-btn"
                  className="btn-secondary py-4 px-8 text-base font-semibold border-white/20 text-cream hover:bg-white/10"
                >
                  Custom Request ✨
                </Link>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-choco-700/50">
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-gold-400">100%</p>
                  <p className="text-xs text-choco-300">Homemade & Fresh</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-gold-400">2+</p>
                  <p className="text-xs text-choco-300">Shape Categories</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-gold-400">Custom</p>
                  <p className="text-xs text-choco-300">Orders Welcome</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image / Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
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

      {/* ─── Active Campaign Banners ─────────────────────────── */}
      {activeCampaigns.filter((c) => !!c.bannerImageUrl).length > 0 && (
        <section className="py-12 bg-cream">
          <div className="page-container">
            <div className="text-center mb-8">
              <h2 className="section-title">🎉 Special Occasions & Festivals</h2>
              <p className="section-subtitle">Exclusive seasonal collections handcrafted for your celebrations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeCampaigns
                .filter((c) => !!c.bannerImageUrl)
                .map((campaign, i) => {
                  const targetUrl = campaign.slug ? `/occasions/${campaign.slug}` : '/special-occasions';

                  return (
                    <motion.div
                      key={campaign._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      whileHover={{ y: -4 }}
                      className="relative overflow-hidden rounded-3xl border border-choco-200 shadow-choco hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="h-56 relative w-full overflow-hidden">
                        <img
                          src={getImageUrl(campaign.bannerImageUrl)}
                          alt={campaign.occasionName}
                          onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-choco-100">
                        <span className="text-xs font-bold text-choco-600">
                          ✨ Exclusive Festival Collection
                        </span>
                        <Link
                          to={targetUrl}
                          id={`campaign-banner-${campaign._id}`}
                          className="btn-gold text-xs px-5 py-2.5 font-bold rounded-xl shadow-xs"
                        >
                          Explore {campaign.occasionName} →
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Coming Soon Teaser Section ──────────────────────── */}
      {upcomingCampaigns.length > 0 && (
        <section className="py-12 bg-choco-50/60 border-t border-b border-choco-100">
          <div className="page-container">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-200 mb-2">
                <span>🔒</span> Upcoming Celebrations
              </span>
              <h2 className="section-title">✨ Coming Soon</h2>
              <p className="section-subtitle">Get ready! These special festival collections are launching soon</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingCampaigns.map((campaign, i) => {
                const theme = campaign.themeColors || { primary: '#7C2D12', secondary: '#D97706', background: '#FFFBEB' };
                const countdownLabel = getCountdownText(campaign.startDate);
                const targetUrl = campaign.slug ? `/occasions/${campaign.slug}` : '/special-occasions';

                return (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    style={{ borderColor: `${theme.secondary}40` }}
                    className="bg-white rounded-3xl border-2 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all"
                  >
                    {/* Locked Watermark Icon */}
                    <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 pointer-events-none">
                      🔒
                    </div>

                    <div>
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          style={{ backgroundColor: theme.primary, color: '#FFF' }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-xs"
                        >
                          <span>⏳</span> {countdownLabel}
                        </span>
                        <span className="text-3xl group-hover:scale-110 transition-transform">{campaign.emoji || '🎉'}</span>
                      </div>

                      <h3 style={{ color: theme.primary }} className="font-display text-xl font-bold mb-2">
                        {campaign.occasionName}
                      </h3>

                      <p className="text-choco-600 text-xs line-clamp-2 leading-relaxed mb-4">
                        {campaign.description || 'Exclusive handcrafted chocolates launching soon for this special day.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-choco-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-choco-400 flex items-center gap-1">
                        <span>📅</span> Launching {new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <Link
                        to={targetUrl}
                        className="text-xs font-bold text-choco-800 hover:text-choco-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                      >
                        Preview →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Category Tiles ────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Two wonderful collections to choose from</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.query)}`}
                  id={`category-${cat.query.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`block bg-gradient-to-br ${cat.bg} rounded-3xl p-8 text-center hover:shadow-choco-lg transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                  <h3 className="font-display text-2xl font-bold text-cream mb-2">{cat.title}</h3>
                  <p className="text-choco-200 text-sm">{cat.description}</p>
                  <span className="inline-block mt-4 text-gold-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="section-title text-left">Featured Creations</h2>
              <p className="section-subtitle text-left">Our most popular handcrafted chocolates</p>
            </div>
            <Link
              to="/products"
              id="view-all-products-btn"
              className="text-choco-800 font-semibold hover:text-choco-600 flex items-center gap-1 text-sm group"
            >
              View All Products
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ──────────────────────────────────── */}
      <section className="py-20 bg-choco-50/50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title">Why NS Choco Delight?</h2>
            <p className="section-subtitle">Crafted with care, delivered with love</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '❤️',
                title: 'Handmade Fresh',
                desc: 'Every order is crafted fresh using premium quality chocolate ingredients.',
              },
              {
                icon: '✨',
                title: 'Customized Designs',
                desc: 'Add custom names, messages, or photo prints on wrapper and chocolates.',
              },
              {
                icon: '🎁',
                title: 'Beautiful Packaging',
                desc: 'Arrives in elegant gift boxes ready to present to your loved ones.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 border border-choco-100 shadow-choco text-center hover:-translate-y-1 transition-transform"
              >
                <div className="w-16 h-16 rounded-2xl bg-choco-100 mx-auto flex items-center justify-center text-3xl mb-6 shadow-inner">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-choco-900 mb-3">{item.title}</h3>
                <p className="text-choco-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WhatsApp CTA Banner ─────────────────────────────── */}
      <section className="py-16 bg-choco-gradient text-cream relative overflow-hidden">
        <div className="page-container text-center relative z-10">
          <span className="text-5xl mb-4 block">💬</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Need a Custom Chocolate Box?
          </h2>
          <p className="text-choco-200 max-w-xl mx-auto mb-8 text-base sm:text-lg font-light">
            Chat with us directly on WhatsApp for bulk orders, event favors, or special customized designs.
          </p>
          <a
            href={buildWhatsAppUrl("Hi! I'd like to ask about a custom chocolate order.")}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-cta-btn"
            className="btn-gold py-4 px-10 text-base font-bold inline-flex items-center gap-3 shadow-gold hover:scale-105 transition-transform"
          >
            <span>💬 Chat on WhatsApp Now</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
