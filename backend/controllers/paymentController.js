const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
  return new Razorpay({ key_id, key_secret });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Protected
const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // amount in rupees

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount.' });
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
    },
  };

  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create(options);

  res.json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Protected
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing payment details.' });
  }

  // Create expected signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpaySignature;

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  res.json({
    success: true,
    message: 'Payment verified successfully.',
    paymentInfo: {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'paid',
    },
  });
};

module.exports = { createRazorpayOrder, verifyPayment };
