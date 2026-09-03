'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProduct, createReview } from '@/api/products';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/StarRating';
import { getImageUrl } from '@/utils/imageUrl';
import { ProductDetailSkeleton } from '@/components/SkeletonLoader';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const prodRes = await getProduct(id);
        if (prodRes.data?.success && prodRes.data?.product) {
          setProduct(prodRes.data.product);
          setReviews(prodRes.data.reviews || []);
          if (prodRes.data.product.shapeOptions?.includes('Normal')) {
            setSelectedShape('Normal');
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Fetch product error:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

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
      toast.success('Review submitted! Thank you 🍫');
      const prodRes = await getProduct(id);
      if (prodRes.data?.product) {
        setProduct(prodRes.data.product);
      }
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
      <div className="py-20 text-center space-y-4">
        <span className="text-5xl block">🍫</span>
        <h2 className="font-display text-2xl font-bold text-choco-900">Product not found.</h2>
        <p className="text-choco-500 text-sm max-w-sm mx-auto">
          The requested chocolate product may have been updated or moved.
        </p>
        <Link href="/products" className="btn-primary inline-flex py-3 px-6 text-sm">
          🛍️ Explore All Chocolates
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images.map((img) => getImageUrl(img)) : [PLACEHOLDER];

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container">
        <nav className="text-sm text-choco-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-choco-800 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-choco-800 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-choco-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-choco-50 shadow-choco border border-choco-100"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === selectedImage
                        ? 'border-choco-700 shadow-choco'
                        : 'border-choco-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="badge bg-choco-100 text-choco-700">
                {product.category === 'Bites' ? '🍬 Bites' : '🍫 Normal / Heart Shape'}
              </span>
              {product.isFeatured && <span className="badge bg-gold-gradient text-choco-900">⭐ Featured</span>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-choco-900 mt-2 mb-3 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.ratingAverage || 4.8} size="md" />
              <span className="text-choco-700 font-semibold">{product.ratingAverage?.toFixed(1) || '4.8'}</span>
              <span className="text-choco-400 text-sm">({product.numReviews || 15} reviews)</span>
            </div>

            <div className="text-4xl font-display font-bold text-choco-900 mb-4">
              ₹{product.price}
            </div>

            <p className="text-choco-600 leading-relaxed mb-6 text-sm md:text-base">{product.description}</p>

            {product.shapeOptions?.length > 0 && (
              <div className="mb-5">
                <p className="label font-semibold text-choco-800 mb-2">Select Shape</p>
                <div className="flex gap-3">
                  {product.shapeOptions.map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShape(shape)}
                      id={`shape-${shape.toLowerCase()}`}
                      className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedShape === shape
                          ? 'border-choco-800 bg-choco-800 text-cream shadow-choco'
                          : 'border-choco-200 text-choco-700 hover:border-choco-400 bg-white'
                      }`}
                    >
                      {shape === 'Heart' ? '♥ Heart Shape' : '◯ Normal Shape'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="label font-semibold text-choco-800 mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-choco-50 rounded-2xl p-1.5 border border-choco-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-choco-800 font-bold shadow-sm hover:bg-choco-100 transition-colors"
                    id="qty-decrease"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-choco-900 text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-choco-800 font-bold shadow-sm hover:bg-choco-100 transition-colors"
                    id="qty-increase"
                  >
                    +
                  </button>
                </div>
                <span className="text-choco-500 text-sm font-medium">
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of stock'}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              id="add-to-cart-btn"
              disabled={product.stock === 0 || adding}
              className="btn-primary w-full py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed mb-3 shadow-choco"
            >
              {adding ? 'Adding to Cart...' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-choco-100 pt-12">
          <h2 className="font-display text-2xl font-bold text-choco-900 mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-choco-100">
              <h3 className="font-semibold text-choco-900 mb-4 text-lg">Write a Review</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} id="review-form">
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
                      placeholder="Share your experience..."
                      className="input-field resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary w-full py-3.5 font-bold"
                    id="submit-review-btn"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 bg-choco-50/60 rounded-2xl border border-choco-100">
                  <p className="text-choco-600 text-sm mb-3">
                    Log in to write a verified review for this chocolate!
                  </p>
                  <Link href="/login" className="btn-secondary inline-flex py-2 px-4 text-xs font-semibold">
                    🔑 Log In Now
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-choco-400 bg-white rounded-3xl border border-choco-100">
                  <span className="text-4xl block mb-3">⭐</span>
                  <p className="font-medium text-choco-700">No reviews yet for this chocolate.</p>
                  <p className="text-xs text-choco-400 mt-1">Be the first to share your feedback!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-2xl p-5 shadow-sm border border-choco-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-choco-gradient flex items-center justify-center text-cream font-bold text-sm shadow-sm">
                        {review.user?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold text-choco-900 text-sm">{review.user?.name || 'Customer'}</p>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <span className="ml-auto text-xs text-choco-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : ''}
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
}
