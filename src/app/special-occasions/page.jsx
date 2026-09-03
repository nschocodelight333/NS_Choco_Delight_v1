'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPublishedCampaigns } from '@/api/campaigns';
import { getImageUrl } from '@/utils/imageUrl';

export default function SpecialOccasionsPage() {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedCampaigns()
      .then((res) => {
        setAllCampaigns(res.data?.campaigns || []);
      })
      .catch((err) => {
        console.error('Error loading published campaigns:', err);
        setAllCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

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
            <Link href="/products" className="btn-primary py-2.5 px-6 text-sm font-bold">
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
                  <div className="p-6 bg-white border-t border-choco-100">
                    <h4 className="font-display font-bold text-choco-900 text-sm">
                      {camp.occasionName}
                    </h4>
                    <Link
                      href={`/occasions/${camp.slug}`}
                      className="btn-gold py-2 px-4 text-xs font-bold rounded-xl shadow-xs mt-3 inline-block"
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
}
