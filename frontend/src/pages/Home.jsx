import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { getImageUrl } from '../utils/imageUrl';
import { getProducts } from '../api/products';
import { getPublishedCampaigns } from '../api/campaigns';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import CampaignPoster from '../components/CampaignPoster';

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

const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: true, limit: 6 })
      .then((res) => setFeaturedProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    getPublishedCampaigns()
      .then((res) => setActiveCampaigns(res.data.campaigns || []))
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
                Celebrate.
              </h1>
              <p className="text-choco-200 text-base md:text-xl leading-relaxed mb-8 max-w-lg">
                Premium homemade chocolates crafted fresh — from luxurious Kunafa-filled creations
                to classic bites. Perfect for every occasion.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/products" id="hero-shop-btn" className="btn-gold text-base px-8 py-3.5 w-full sm:w-auto text-center">
                  Shop Now →
                </Link>
                <a
                  href={buildWhatsAppUrl(user?.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hero-whatsapp-btn"
                  className="btn-secondary border-cream text-cream hover:bg-cream hover:text-choco-900 text-base px-8 py-3.5 w-full sm:w-auto text-center"
                >
                  Order on WhatsApp
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-6 mt-10">
                {[
                  { icon: '🏠', label: 'Homemade' },
                  { icon: '🚚', label: 'Fast Delivery' },
                  { icon: '💝', label: 'Gift Ready' },
                  { icon: '⭐', label: '5-Star Taste' },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-2">
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-choco-200 text-sm">{t.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero image side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center float-animation">
                  <div className="w-64 h-64 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                    <span className="text-9xl filter drop-shadow-2xl">🍫</span>
                  </div>
                </div>
                {/* Floating tags */}
                <div className="absolute top-4 -right-8 glass rounded-2xl px-4 py-2 shadow-choco">
                  <p className="text-choco-900 text-xs font-semibold">Pistachio Kunafa</p>
                  <p className="text-gold-600 font-bold">₹260</p>
                </div>
                <div className="absolute bottom-8 -left-12 glass rounded-2xl px-4 py-2 shadow-choco">
                  <p className="text-choco-900 text-xs font-semibold">Free delivery</p>
                  <p className="text-green-600 text-xs">above ₹500</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80H1440V40C1200 0 960 80 720 40C480 0 240 80 0 40V80Z" fill="#FFF8F0" />
          </svg>
        </div>
      </section>

      {/* ─── Active Campaign Banners ─────────────────────────── */}
      {activeCampaigns.length > 0 && (
        <section className="py-10 bg-cream">
          <div className="page-container">
            <div className="text-center mb-6">
              <h2 className="section-title">🎉 Special Occasions & Festivals</h2>
              <p className="section-subtitle">Exclusive seasonal collections handcrafted for your celebrations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeCampaigns.map((campaign, i) => {
                const theme = campaign.themeColors || { primary: '#7C2D12', secondary: '#D97706', background: '#FFFBEB' };
                const emoji = campaign.emoji || '🎉';
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
                    {campaign.bannerImageUrl ? (
                      <div className="h-56 relative w-full overflow-hidden">
                        <img
                          src={getImageUrl(campaign.bannerImageUrl)}
                          alt={campaign.occasionName}
                          onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div style={{ backgroundColor: theme.background }} className="p-6 sm:p-8 relative">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl drop-shadow-md">{emoji}</span>
                          <div>
                            <p style={{ color: theme.secondary }} className="text-xs font-bold uppercase tracking-wider mb-1">
                              Special Occasion
                            </p>
                            <h3 style={{ color: theme.primary }} className="font-display text-2xl font-bold">
                              {campaign.occasionName}
                            </h3>
                            {campaign.description && (
                              <p className="text-choco-600 text-sm mt-1 line-clamp-2">{campaign.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

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

      {/* ─── Featured Products ──────────────────────────────── */}
      <section className="py-20 bg-choco-50">
        <div className="page-container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Featured Chocolates</h2>
              <p className="section-subtitle">Our most-loved creations</p>
            </div>
            <Link to="/products" className="text-choco-700 hover:text-choco-900 text-sm font-medium transition-colors hidden md:block">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-choco-500">No featured products yet. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" id="home-view-all-btn" className="btn-primary text-base px-8 py-4">
              View All Chocolates
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Why NS Choco Delight?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏠', title: 'Homemade', desc: 'Made fresh in small batches with premium ingredients — not mass-produced.' },
              { icon: '🎁', title: 'Gift Ready', desc: 'Beautiful packaging for birthdays, anniversaries, and festivals.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Free delivery on orders above ₹500. Delivered with care.' },
              { icon: '⭐', title: 'Premium Quality', desc: 'Real chocolate, real nuts, real love — no artificial shortcuts.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-choco transition-shadow"
              >
                <span className="text-4xl block mb-4">{item.icon}</span>
                <h3 className="font-display font-semibold text-choco-900 text-lg mb-2">{item.title}</h3>
                <p className="text-choco-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────── */}
      <section className="py-20 bg-choco-gradient">
        <div className="page-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">
              Ready to indulge?
            </h2>
            <p className="text-choco-200 text-lg mb-8">
              Place your order now and get your chocolates delivered fresh.
            </p>
            <Link to="/products" id="cta-shop-btn" className="btn-gold text-lg px-10 py-4">
              Order Now — It's Fresh! 🍫
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
