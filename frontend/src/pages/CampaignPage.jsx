import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCampaign } from '../api/campaigns';
import { getImageUrl } from '../utils/imageUrl';
import ProductCard from '../components/ProductCard';

const OCCASION_EMOJIS = {
  Valentines: '💗',
  MothersDay: '🌸',
  FathersDay: '👔',
  Diwali: '🪔',
  Christmas: '🎄',
  Eid: '🌙',
  NewYear: '🎆',
  Custom: '🎉',
};

const CampaignPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCampaign(id)
      .then((res) => setCampaign(res.data.campaign))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-20 space-y-8 animate-pulse">
        <div className="h-48 bg-choco-100 rounded-3xl" />
        <div className="h-8 bg-choco-100 rounded-xl w-1/2 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-choco-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="page-container py-24 text-center">
        <span className="text-6xl block mb-4">😞</span>
        <h2 className="font-display text-2xl font-bold text-choco-900 mb-2">Campaign not found</h2>
        <p className="text-choco-500 mb-6">This campaign may have expired or doesn't exist.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const emoji = OCCASION_EMOJIS[campaign.occasion] || '🎉';
  const availableProducts = campaign.products?.filter((p) => p.isAvailable !== false) || [];

  return (
    <div>
      {/* ─── Banner ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-choco-gradient min-h-[320px] flex items-center">
        {campaign.bannerImageUrl ? (
          <>
            <div className="absolute inset-0">
              <img src={getImageUrl(campaign.bannerImageUrl)} alt={campaign.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-choco-900/65" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gold-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-choco-700/30 blur-3xl" />
          </div>
        )}
        <div className="page-container relative z-10 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-6xl block mb-4 drop-shadow-lg">{emoji}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">{campaign.title}</h1>
            {campaign.description && (
              <p className="text-choco-200 text-lg max-w-2xl mx-auto leading-relaxed">{campaign.description}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-4 text-choco-300 text-sm">
              <span>📅 Until {new Date(campaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </motion.div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60H1440V30C1200 0 960 60 720 30C480 0 240 60 0 30V60Z" fill="#FFF8F0" /></svg>
        </div>
      </section>

      {/* ─── Hampers ─────────────────────────────────────────────── */}
      {campaign.hampers?.length > 0 && (
        <section className="py-16 bg-cream">
          <div className="page-container">
            <div className="text-center mb-10">
              <h2 className="section-title">🎁 Gift Hampers</h2>
              <p className="section-subtitle">Curated bundles crafted for this occasion</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaign.hampers.map((hamper, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl overflow-hidden shadow-choco hover:shadow-choco-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {hamper.imageUrl ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={getImageUrl(hamper.imageUrl)} alt={hamper.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-choco-800 to-choco-900 flex items-center justify-center">
                      <span className="text-6xl">{emoji}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-xl font-bold text-choco-900 mb-1">{hamper.name}</h3>
                    {hamper.description && <p className="text-choco-500 text-sm mb-3 leading-relaxed">{hamper.description}</p>}
                    {hamper.includedItems?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-choco-600 mb-1.5">Includes:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {hamper.includedItems.map((item) => (
                            <span key={typeof item === 'object' ? item._id : item}
                              className="text-xs bg-choco-50 text-choco-700 px-2.5 py-1 rounded-full border border-choco-100">
                              {typeof item === 'object' ? item.name : 'Product'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="font-display text-2xl font-bold text-choco-900">₹{hamper.price?.toLocaleString('en-IN')}</p>
                        {hamper.stock > 0 && <p className="text-xs text-emerald-600 font-medium">{hamper.stock} left in stock</p>}
                        {hamper.stock === 0 && <p className="text-xs text-red-500 font-medium">Out of stock</p>}
                      </div>
                      <a href="https://wa.me/918185920511?text=Hi! I'd like to order this gift hamper from NS Choco Delight." target="_blank" rel="noopener noreferrer"
                        className="btn-gold text-sm px-5 py-2.5">
                        Order via WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Products ─────────────────────────────────── */}
      {availableProducts.length > 0 && (
        <section className="py-16 bg-choco-50">
          <div className="page-container">
            <div className="text-center mb-10">
              <h2 className="section-title">🍫 Featured Chocolates</h2>
              <p className="section-subtitle">Handpicked for this occasion</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProducts.map((product, i) => (
                <motion.div key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  viewport={{ once: true }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-choco-gradient">
        <div className="page-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
              Make it extra special {emoji}
            </h2>
            <p className="text-choco-200 mb-8">Want something unique? Request a fully customized chocolate.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/customize" className="btn-gold text-base px-8 py-3">✏️ Customize Your Chocolate</Link>
              <Link to="/products" className="btn-secondary border-cream text-cream hover:bg-cream hover:text-choco-900 text-base px-8 py-3">View All Products</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CampaignPage;
