import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPublishedCampaigns, getCampaignBySlug } from '../api/campaigns';
import { getImageUrl } from '../utils/imageUrl';
import ProductCard from '../components/ProductCard';

const SpecialOccasionsPage = () => {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);

  useEffect(() => {
    setBannerFailed(false);
    setLoading(true);
    setNotFound(false);

    if (slug) {
      // Single Campaign Page View
      getCampaignBySlug(slug)
        .then((res) => {
          if (res.data?.success && res.data?.campaign) {
            setCampaign(res.data.campaign);
          } else {
            setNotFound(true);
          }
        })
        .catch((err) => {
          console.error('Campaign not available:', err);
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    } else {
      // All Published Campaigns Grid View
      getPublishedCampaigns()
        .then((res) => {
          setAllCampaigns(res.data?.campaigns || []);
        })
        .catch((err) => {
          console.error('Error loading published campaigns:', err);
          setAllCampaigns([]);
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  // ─── 1. Clean 404 / Unavailable State ──────────────────────────────────────
  if (slug && notFound && !loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 text-center bg-cream/30">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-choco-lg border border-choco-100">
          <span className="text-6xl block mb-4">✨</span>
          <h2 className="font-display text-2xl font-bold text-choco-900 mb-2">
            This page isn't available
          </h2>
          <p className="text-choco-600 text-sm mb-6 leading-relaxed">
            This occasion collection might be unpublished, expired, or unavailable right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/special-occasions" className="btn-gold py-3 px-5 text-sm font-bold">
              🎉 View All Occasions
            </Link>
            <Link to="/products" className="btn-secondary py-3 px-5 text-sm font-bold">
              🍫 Browse Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. Single Campaign Dynamic Page View ────────────────────────────────────
  if (slug && campaign && !loading) {
    const theme = campaign.themeColors || { primary: '#7C2D12', secondary: '#D97706', background: '#FFFBEB' };
    const prods = campaign.products || {};
    const isProductsArray = Array.isArray(prods);

    const specialProducts = isProductsArray ? prods : (prods.special || []);
    const hamperProducts = isProductsArray ? (campaign.hampers || []) : (prods.hampers || []);
    const wrapperProducts = isProductsArray ? [] : (prods.customWrappers || []);
    const normalProducts = isProductsArray ? [] : (prods.normal || []);

    return (
      <div
        style={{
          '--theme-primary': theme.primary,
          '--theme-secondary': theme.secondary,
          '--theme-bg': theme.background,
        }}
        className="min-h-screen bg-[var(--theme-bg)] transition-colors duration-500 pb-16"
      >
        {/* Dynamic Hero Banner */}
        <section
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, #3E2723 100%)`,
          }}
          className="text-white py-12 sm:py-16 relative overflow-hidden shadow-lg"
        >
          <div className="page-container relative z-10 max-w-5xl mx-auto">
            {campaign.bannerImageUrl && !bannerFailed ? (
              /* Display Uploaded Banner Image Prominently */
              <div className="flex flex-col gap-6">
                <div className="w-full max-h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 relative">
                  <img
                    src={getImageUrl(campaign.bannerImageUrl)}
                    alt={campaign.occasionName}
                    onError={() => setBannerFailed(true)}
                    className="w-full h-full object-cover max-h-96"
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <span className="text-3xl">{campaign.emoji || '🎉'}</span>
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-cream">
                      {campaign.occasionName}
                    </h1>
                  </div>
                  {campaign.description && (
                    <p className="text-cream/90 text-sm sm:text-base max-w-2xl">
                      {campaign.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Clean Hero Title Header when No Banner Image is Uploaded */
              <div className="text-center py-6 space-y-4 max-w-2xl mx-auto">
                <span
                  style={{ backgroundColor: theme.secondary, color: '#FFF' }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-md"
                >
                  <span>{campaign.emoji || '🎉'}</span> Special Occasion Collection
                </span>

                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-cream leading-tight drop-shadow-md">
                  {campaign.occasionName}
                </h1>

                <p className="text-cream/90 text-base sm:text-lg leading-relaxed">
                  {campaign.description || 'Handcrafted gourmet chocolates created specially for this occasion.'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic 4 Product Sections */}
        <div className="page-container py-12 space-y-14 max-w-6xl mx-auto">
          {/* Section 1: Special Collection */}
          {specialProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 border-b pb-3 border-choco-200">
                <span className="text-2xl">✨</span>
                <div>
                  <h2 style={{ color: theme.primary }} className="font-display text-2xl font-bold">
                    Special Collection
                  </h2>
                  <p className="text-choco-600 text-xs">Exclusive handcrafted occasion creations</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {specialProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Hampers & Combos */}
          {hamperProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 border-b pb-3 border-choco-200">
                <span className="text-2xl">🎁</span>
                <div>
                  <h2 style={{ color: theme.primary }} className="font-display text-2xl font-bold">
                    Gourmet Hampers & Combos
                  </h2>
                  <p className="text-choco-600 text-xs">Curated gift boxes & special hampers</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {hamperProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Customized Wrappers */}
          {wrapperProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 border-b pb-3 border-choco-200">
                <span className="text-2xl">🏷️</span>
                <div>
                  <h2 style={{ color: theme.primary }} className="font-display text-2xl font-bold">
                    Customized Wrappers
                  </h2>
                  <p className="text-choco-600 text-xs">Personalized wrappers for this celebration</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wrapperProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Section 4: All Popular Chocolates */}
          {normalProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 border-b pb-3 border-choco-200">
                <span className="text-2xl">🍫</span>
                <div>
                  <h2 style={{ color: theme.primary }} className="font-display text-2xl font-bold">
                    Classic Chocolates
                  </h2>
                  <p className="text-choco-600 text-xs">Popular homemade favorites</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {normalProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Fallback if campaign has zero products attached */}
          {specialProducts.length === 0 &&
            hamperProducts.length === 0 &&
            wrapperProducts.length === 0 &&
            normalProducts.length === 0 && (
              <div className="text-center py-16 bg-white/80 rounded-3xl p-8 border border-choco-100 max-w-md mx-auto">
                <span className="text-5xl block mb-3">🎁</span>
                <h3 className="font-display font-bold text-xl text-choco-900 mb-2">
                  Occasion Collection Coming Soon
                </h3>
                <p className="text-choco-600 text-sm mb-6">
                  Products for this special day are currently being prepared with love. Check back soon!
                </p>
                <Link to="/products" className="btn-gold py-2.5 px-6 text-sm font-bold">
                  Browse Full Catalog
                </Link>
              </div>
            )}
        </div>
      </div>
    );
  }

  // ─── 3. Showcase Grid View (When url is /special-occasions) ────────────────
  return (
    <div className="min-h-screen bg-cream/40 py-12">
      <div className="page-container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-full text-gold-800 text-xs font-bold uppercase tracking-widest mb-4">
            🎉 Special Occasions Showcase
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-choco-900 mb-4">
            Celebrate Every Special Day
          </h1>
          <p className="text-choco-600 text-base max-w-2xl mx-auto">
            Explore curated festival collections, gourmet hampers, and custom chocolates handcrafted with love.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-choco-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : allCampaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-choco-100 p-8 max-w-md mx-auto">
            <span className="text-5xl block mb-3">✨</span>
            <h3 className="font-display font-bold text-xl text-choco-900 mb-2">No active occasion collections</h3>
            <p className="text-choco-600 text-sm mb-6">Check back soon for upcoming festival celebrations!</p>
            <Link to="/products" className="btn-primary py-2.5 px-6 text-sm font-bold">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCampaigns.map((camp) => {
              const theme = camp.themeColors || { primary: '#7C2D12', secondary: '#D97706', background: '#FFFBEB' };
              return (
                <motion.div
                  key={camp._id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl overflow-hidden border border-choco-200 shadow-choco hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  {camp.bannerImageUrl ? (
                    <div className="h-48 relative w-full overflow-hidden">
                      <img
                        src={getImageUrl(camp.bannerImageUrl)}
                        alt={camp.occasionName}
                        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      style={{ backgroundColor: theme.background }}
                      className="p-6 relative border-b border-choco-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-4xl drop-shadow-sm">{camp.emoji || '🎉'}</span>
                        <div>
                          <h3 style={{ color: theme.primary }} className="font-display text-xl font-bold">
                            {camp.occasionName}
                          </h3>
                          <p className="text-choco-600 text-xs line-clamp-1 mt-0.5">
                            {camp.description || 'Special occasion collection'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex items-center justify-between mt-auto bg-white border-t border-choco-100">
                    <div>
                      <h4 className="font-display font-bold text-choco-900 text-sm">
                        {camp.occasionName}
                      </h4>
                      <span className="text-[11px] text-choco-500 font-medium">
                        ✨ Exclusive Collection
                      </span>
                    </div>
                    <Link
                      to={`/occasions/${camp.slug}`}
                      className="btn-gold py-2 px-4 text-xs font-bold rounded-xl shadow-xs"
                    >
                      Explore →
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialOccasionsPage;
