const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Check if the authenticated user can review a product
//          (has a Delivered order containing this product and hasn't reviewed yet)
// @route   GET /api/products/:id/can-review
// @access  Protected
const checkCanReview = async (req, res) => {
  const productId = req.params.id;

  // Must have a Delivered order containing this product
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    orderStatus: 'Delivered',
  });

  if (!deliveredOrder) {
    return res.json({ success: true, canReview: false, reason: 'no_delivered_order' });
  }

  // Must not have already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    return res.json({ success: true, canReview: false, reason: 'already_reviewed' });
  }

  return res.json({ success: true, canReview: true, orderId: deliveredOrder._id });
};

// @desc    Create a review for a product (verified buyers only)
// @route   POST /api/products/:id/reviews
// @access  Protected (customer)
const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  // ── Verified Buyer Check ─────────────────────────────────────────────
  // User must have an order with this product that has been Delivered
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    orderStatus: 'Delivered',
  });

  if (!deliveredOrder) {
    return res.status(403).json({
      success: false,
      message: 'You can only review items you\'ve purchased and received.',
    });
  }
  // ────────────────────────────────────────────────────────────────────

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ product: productId, user: req.user._id });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product.',
    });
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: deliveredOrder._id,
    verifiedPurchase: true,
    rating: Number(rating),
    comment,
  });

  // Explicitly trigger rating calculation on product
  await Review.calcAverageRating(productId);

  // Populate user name for response
  await review.populate('user', 'name');

  res.status(201).json({ success: true, review });
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
};

module.exports = { createReview, getProductReviews, checkCanReview };
