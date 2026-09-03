'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProducts } from '@/api/products';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';

const CATEGORIES = ['Normal Shape or Heart', 'Bites'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const getFiltersFromUrl = () => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1') || 1,
  });

  const [filters, setFilters] = useState(getFiltersFromUrl);

  useEffect(() => {
    setFilters(getFiltersFromUrl());
  }, [searchParams.toString()]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.rating) params.rating = filters.rating;
      if (filters.sort) params.sort = filters.sort;

      const res = await getProducts(params);
      const fetchedProducts = res.data.products || [];
      setProducts(fetchedProducts);
      setTotal(res.data.count || fetchedProducts.length);
      setPages(1);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', page: 1 });
    router.push('/products');
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.rating;

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title">Our Chocolates</h1>
          <p className="section-subtitle">{total} products available</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden w-full btn-secondary mb-4 justify-between"
              id="mobile-filter-toggle"
            >
              <span>🔍 Filters {hasActiveFilters ? '(active)' : ''}</span>
              <svg className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`space-y-6 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-choco-100">
                <h3 className="font-semibold text-choco-900 mb-3 text-sm">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    id="product-search"
                    placeholder="Search chocolates..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="input-field pr-10"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-choco-100">
                <h3 className="font-semibold text-choco-900 mb-3 text-sm">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-choco-800 text-cream font-medium' : 'text-choco-700 hover:bg-choco-50'}`}
                    id="filter-category-all"
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat ? 'bg-choco-800 text-cream font-medium' : 'text-choco-700 hover:bg-choco-50'}`}
                      id={`filter-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {cat === 'Bites' ? '🍬 ' : '🍫 '}{cat}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} id="clear-filters-btn" className="w-full btn-danger py-2.5">
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <p className="text-choco-600 text-sm">
                {loading ? 'Loading...' : `${total} result${total !== 1 ? 's' : ''}`}
              </p>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field max-w-[200px]"
                id="sort-select"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <span className="text-6xl block mb-4">🍫</span>
                <h3 className="font-display text-2xl font-bold text-choco-900 mb-2">No chocolates found</h3>
                <p className="text-choco-500 mb-6">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page-container py-20 text-center">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
