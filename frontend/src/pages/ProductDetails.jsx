import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, getProductReviews, createReview, checkCanReview } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { getImageUrl } from '../utils/imageUrl';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80';

const ProductDetails = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review eligibility
  const [canReview, setCanReview] = useState(false);
  const [canReviewLoading, setCanReviewLoading] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          getProduct(id),
          getProductReviews(id),
        ]);
        setProduct(prodRes.data.product);
        setReviews(revRes.data.reviews || []);
        // Default shape
        if (prodRes.data.product.shapeOptions?.includes('Normal')) {
          setSelectedShape('Normal');
        }
      } catch (err) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Check review eligibility once product + user are both available
  useEffect(() => {
    if (!user || !id) return;
    const fetchCanReview = async () => {
      setCanReviewLoading(true);
      try {
        const res = await checkCanReview(id);
        setCanReview(res.data.canReview);
        setAlreadyReviewed(res.data.reason === 'already_reviewed');
      } catch {
        setCanReview(false);
      } finally {
        setCanReviewLoading(false);
      }
    };
    fetchCanReview();
  }, [user, id]);

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(product._id, quantity, selectedShape);
    setAdding(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await createReview(id, { rating: reviewRating, comment: reviewComment });
      setReviews((prev) => [res.data.review, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      setCanReview(false);
      setAlreadyReviewed(true);
      toast.success('Review submitted! Thank you 🍫');
      // Refresh product rating
      const prodRes = await getProduct(id);
      setProduct(prodRes.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 page-container">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-choco-600 text-lg">Product not found.</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images.map((img) => getImageUrl(img)) : [PLACEHOLDER];

  // ── Review Panel Content ──────────────────────────────────────────────
  const renderReviewPanel = () => {
    if (!user) {
      return (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">🔒</span>
          <p className="text-choco-600 text-sm mb-4">
            <Link to="/login" className="text-choco-800 font-semibold underline underline-offset-2">Log in</Link>{' '}
            to write a review.
          </p>
          <p className="text-choco-400 text-xs">Only verified buyers can review products.</p>
        </div>
      );
    }

    if (canReviewLoading) {
      return (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-choco-100 rounded-full w-3/4" />
          <div className="h-4 bg-choco-100 rounded-full w-1/2" />
          <div className="h-24 bg-choco-100 rounded-xl" />
          <div className="h-10 bg-choco-100 rounded-xl" />
        </div>
      );
    }

    if (alreadyReviewed) {
      return (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">✅</span>
          <p className="font-semibold text-choco-900 mb-1">Review submitted!</p>
          <p className="text-choco-500 text-sm">You've already reviewed this product. Thank you!</p>
        </div>
      );
    }

    if (!canReview) {
      return (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">🛍️</span>
          <p className="font-semibold text-choco-900 mb-2">Purchase required to review</p>
          <p className="text-choco-500 text-sm mb-4">
            You can only review items you've purchased and received.
          </p>
          <Link to="/products" className="btn-secondary text-sm py-2 px-4 inline-flex">
            Browse Our Chocolates
          </Link>
        </div>
      );
    }

    // User is eligible — show the form
    return (
      <form onSubmit={handleSubmitReview} id="review-form">
        <div className="flex items-center gap-2 mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Verified Purchase — you're eligible to review this product
        </div>
        <div className="mb-4">
          <label className="label">Your Rating</label>
          <StarRating rating={reviewRating} interactive onRate={setReviewRating} size="lg" />
        </div>
        <div className="mb-4">
          <label className="label" htmlFor="review-comment">Comment (optional)</label>
          <textarea
            id="review-comment"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            placeholder="Share your experience with this chocolate..."
            className="input-field resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submittingReview}
          className="btn-primary w-full"
          id="submit-review-btn"
        >
          {submittingReview ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Review'}
        </button>
      </form>
    );
  };

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container">
        {/* Breadcrumb */}
        <nav className="text-sm text-choco-500 mb-8">
          <Link to="/" className="hover:text-choco-800">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-choco-800">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-choco-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* ─── Image Gallery ──────────────────────────── */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-choco-50 shadow-choco"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-choco-700 shadow-choco' : 'border-choco-200 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ────────────────────────────── */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="badge bg-choco-100 text-choco-700">{product.category}</span>
              {product.isFeatured && <span className="badge bg-gold-gradient text-choco-900 ml-2">⭐ Featured</span>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-choco-900 mt-2 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.ratingAverage} size="md" />
              <span className="text-choco-700 font-medium">{product.ratingAverage?.toFixed(1) || '0.0'}</span>
              <span className="text-choco-400 text-sm">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="text-4xl font-display font-bold text-choco-900 mb-4">
              ₹{product.price}
            </div>

            <p className="text-choco-600 leading-relaxed mb-6">{product.description}</p>

            {/* Shape Selector */}
            {product.shapeOptions?.length > 0 && (
              <div className="mb-5">
                <p className="label">Shape</p>
                <div className="flex gap-3">
                  {product.shapeOptions.map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShape(shape)}
                      id={`shape-${shape.toLowerCase()}`}
                      className={`px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedShape === shape
                          ? 'border-choco-800 bg-choco-800 text-cream shadow-choco'
                          : 'border-choco-200 text-choco-700 hover:border-choco-400'
                      }`}
                    >
                      {shape === 'Heart' ? '♥ Heart' : '◯ Normal'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="label">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-choco-50 rounded-xl p-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-choco-800 font-bold shadow-sm hover:bg-choco-100 transition-colors"
                    id="qty-decrease"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-choco-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-choco-800 font-bold shadow-sm hover:bg-choco-100 transition-colors"
                    id="qty-increase"
                  >
                    +
                  </button>
                </div>
                <span className="text-choco-500 text-sm">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              id="add-to-cart-btn"
              disabled={product.stock === 0 || adding}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {adding ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Adding...
                </span>
              ) : (
                '🛒 Add to Cart'
              )}
            </button>

            {/* Stock warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-orange-600 text-sm font-medium text-center">
                ⚠️ Only {product.stock} left!
              </p>
            )}
          </div>
        </div>

        {/* ─── Reviews Section ─────────────────────────────── */}
        <div className="border-t border-choco-100 pt-12">
          <h2 className="font-display text-2xl font-bold text-choco-900 mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Write a review panel */}
            <div className={`rounded-2xl p-6 shadow-sm border transition-all ${
              canReview ? 'bg-amber-50/30 border-amber-300 ring-2 ring-amber-400/20' : 'bg-white border-choco-100'
            }`}>
              <h3 className="font-semibold text-choco-900 mb-4 flex items-center justify-between">
                <span>Write a Review</span>
                {canReview && (
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                    ⭐ Eligible Buyer
                  </span>
                )}
              </h3>
              {renderReviewPanel()}
            </div>

            {/* Reviews list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-choco-400">
                  <span className="text-4xl block mb-3">⭐</span>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-2xl p-5 shadow-sm border border-choco-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-choco-gradient flex items-center justify-center text-cream font-bold text-sm">
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-choco-900 text-sm">{review.user?.name}</p>
                          {review.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <span className="ml-auto text-xs text-choco-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {review.comment && <p className="text-choco-600 text-sm leading-relaxed">{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
