import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';

const CATEGORIES = ['Normal Shape or Heart', 'Bites'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  // Keep filters state in sync with URL searchParams
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

  // Sync state if URL changes externally
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
      params.page = filters.page;
      params.limit = 12;

      const res = await getProducts(params);
      const fetchedProducts = res.data.products || [];
      const fetchedTotal = res.data.total || 0;
      const fetchedPages = res.data.pages || 1;

      if (fetchedTotal > 0 && fetchedProducts.length === 0 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: 1 }));
        return;
      }

      setProducts(fetchedProducts);
      setTotal(fetchedTotal);
      setPages(fetchedPages);
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
    const params = {};
    Object.entries(updated).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    const reset = { search: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', page: 1 };
    setFilters(reset);
    setSearchParams({ sort: 'newest', page: '1' }, { replace: true });
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.rating;

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Our Chocolates</h1>
          <p className="section-subtitle">{total} products available</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Filters Sidebar ─────────────────────────── */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile filter toggle */}
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
              {/* Search */}
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
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-choco-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category */}
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

              {/* Price Range */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-choco-100">
                <h3 className="font-semibold text-choco-900 mb-3 text-sm">Price Range (₹)</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="input-field text-center"
                    id="filter-min-price"
                    min={0}
                  />
                  <span className="text-choco-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="input-field text-center"
                    id="filter-max-price"
                    min={0}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-choco-100">
                <h3 className="font-semibold text-choco-900 mb-3 text-sm">Min Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateFilter('rating', filters.rating == r ? '' : r)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${filters.rating == r ? 'bg-choco-800 text-cream' : 'text-choco-700 hover:bg-choco-50'}`}
                      id={`filter-rating-${r}`}
                    >
                      {'★'.repeat(r)}{'☆'.repeat(5 - r)} & above
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

          {/* ─── Product Grid ─────────────────────────────── */}
          <div className="flex-1">
            {/* Sort + results count */}
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
                {[...Array(9)].map((_, i) => <ProductCardSkeleton key={i} />)}
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
              <>
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

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                      disabled={filters.page <= 1}
                      className="btn-secondary py-2 px-4 disabled:opacity-40"
                      id="pagination-prev"
                    >
                      ← Prev
                    </button>
                    <span className="text-choco-700 text-sm font-medium px-4">
                      Page {filters.page} of {pages}
                    </span>
                    <button
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                      disabled={filters.page >= pages}
                      className="btn-secondary py-2 px-4 disabled:opacity-40"
                      id="pagination-next"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
