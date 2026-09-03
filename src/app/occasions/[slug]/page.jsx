'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCampaignBySlug } from '@/api/campaigns';
import ProductCard from '@/components/ProductCard';

export default function OccasionDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getCampaignBySlug(slug)
      .then((res) => {
        if (res.data?.success && res.data?.campaign) {
          setCampaign(res.data.campaign);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl float-animation">🍫</div>
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-choco-lg border border-choco-100">
          <h2 className="font-display text-2xl font-bold text-choco-900 mb-2">Collection Not Available</h2>
          <Link href="/special-occasions" className="btn-gold py-3 px-5 text-sm font-bold mt-4 inline-block">
            View All Occasions
          </Link>
        </div>
      </div>
    );
  }

  const prods = campaign.products || {};
  const isProductsArray = Array.isArray(prods);
  const specialProducts = isProductsArray ? prods : (prods.special || []);

  return (
    <div className="min-h-screen py-12">
      <div className="page-container max-w-6xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold text-choco-900 mb-6">{campaign.occasionName}</h1>
        <p className="text-choco-600 mb-8">{campaign.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
