const CustomOrderRequest = require('../models/CustomOrderRequest');
const Order = require('../models/Order');
const User = require('../models/User');

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

// ─── Customer: Submit Custom Order Request ────────────────────────────────────
// @route POST /api/custom-orders
const submitCustomOrder = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  // Handle uploaded reference images (Cloudinary URL or local static URL)
  const referenceImageUrls = req.files
    ? req.files.map((f) => {
        if (f.path && (f.path.startsWith('http://') || f.path.startsWith('https://'))) {
          return f.path;
        }
        return `/uploads/${f.filename}`;
      })
    : [];

  const request = await CustomOrderRequest.create({
    userId: req.user._id,
    title: title.trim(),
    description: description.trim(),
    referenceImageUrls,
  });

  await request.populate('userId', 'name email phone');
  res.status(201).json({ success: true, request });
};

// ─── Customer: Get My Custom Orders ──────────────────────────────────────────
// @route GET /api/custom-orders/my
const getMyCustomOrders = async (req, res) => {
  const requests = await CustomOrderRequest.find({ userId: req.user._id })
    .populate('convertedOrderId', '_id orderStatus totalAmount')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
};

// ─── Customer: Respond to Quote (Accept or Reject) ───────────────────────────
// @route POST /api/custom-orders/:id/respond
const respondToQuote = async (req, res) => {
  const { action } = req.body; // 'accept' | 'reject'

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: "Action must be 'accept' or 'reject'." });
  }

  const request = await CustomOrderRequest.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Custom order request not found.' });
  }

  if (request.status !== 'Quoted') {
    return res.status(400).json({ success: false, message: 'This request has not been quoted yet or is no longer active.' });
  }

  request.status = action === 'accept' ? 'Accepted' : 'Rejected';
  request.respondedAt = new Date();
  await request.save();

  res.json({ success: true, request });
};

// ─── Customer: Checkout Accepted Custom Order ─────────────────────────────────
// @route POST /api/custom-orders/:id/checkout
const checkoutCustomOrder = async (req, res) => {
  const { deliveryAddress, paymentInfo } = req.body;

  const request = await CustomOrderRequest.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Custom order request not found.' });
  }

  if (request.status !== 'Accepted') {
    return res.status(400).json({
      success: false,
      message: 'This request must be in "Accepted" status to proceed to checkout.',
    });
  }

  if (!request.quotedPrice) {
    return res.status(400).json({ success: false, message: 'No quoted price found for this request.' });
  }

  const isTakeaway = paymentInfo?.paymentMethod === 'takeaway' || deliveryAddress?.isTakeaway;
  const deliveryFee = isTakeaway ? 0 : (request.quotedPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE);
  const totalAmount = request.quotedPrice + deliveryFee;

  // Create a regular Order for this custom request
  const order = await Order.create({
    user: req.user._id,
    items: [
      {
        name: request.title,
        image: request.referenceImageUrls?.[0] || '',
        price: request.quotedPrice,
        quantity: 1,
        shape: '',
      },
    ],
    deliveryAddress,
    itemsTotal: request.quotedPrice,
    deliveryFee,
    totalAmount,
    paymentInfo: paymentInfo || { status: 'cod' },
    orderStatus: paymentInfo?.status === 'paid' ? 'Confirmed' : 'Pending',
    notes: `Custom Order: ${request.title}`,
  });

  // Update request status
  request.status = 'Converted to Order';
  request.convertedOrderId = order._id;
  await request.save();

  // Update user profile address & phone automatically if provided and not takeaway
  if (deliveryAddress && !isTakeaway) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          address: {
            street: deliveryAddress.street || '',
            city: deliveryAddress.city || '',
            state: deliveryAddress.state || '',
            pincode: deliveryAddress.pincode || '',
          },
          phone: deliveryAddress.phone || req.user.phone || '',
        },
      });
    } catch (e) { /* ignore */ }
  }

  res.status(201).json({ success: true, order });
};

// ─── Admin: Get All Custom Order Requests ────────────────────────────────────
// @route GET /api/admin/custom-orders
const getAllCustomOrders = async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const requests = await CustomOrderRequest.find(query)
    .populate('userId', 'name email phone')
    .populate('convertedOrderId', '_id orderStatus totalAmount')
    .sort({ createdAt: -1 });

  // Sort: Pending Review first, then by date
  const sorted = [
    ...requests.filter((r) => r.status === 'Pending Review'),
    ...requests.filter((r) => r.status !== 'Pending Review'),
  ];

  res.json({ success: true, requests: sorted });
};

// ─── Admin: Set Quote ─────────────────────────────────────────────────────────
// @route PUT /api/admin/custom-orders/:id/quote
const setQuote = async (req, res) => {
  const { quotedPrice, adminNotes } = req.body;

  if (!quotedPrice || Number(quotedPrice) <= 0) {
    return res.status(400).json({ success: false, message: 'A valid quoted price is required.' });
  }

  const request = await CustomOrderRequest.findById(req.params.id).populate('userId', 'name email phone');
  if (!request) {
    return res.status(404).json({ success: false, message: 'Custom order request not found.' });
  }

  if (['Converted to Order', 'Cancelled'].includes(request.status)) {
    return res.status(400).json({ success: false, message: 'Cannot quote on a completed or cancelled request.' });
  }

  request.quotedPrice = Number(quotedPrice);
  if (adminNotes !== undefined) request.adminNotes = adminNotes;
  request.status = 'Quoted';
  request.quotedAt = new Date();
  await request.save();

  res.json({ success: true, request });
};

// ─── Admin: Update Request Status ────────────────────────────────────────────
// @route PUT /api/admin/custom-orders/:id/status
const updateCustomOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    'Pending Review', 'Quoted', 'Accepted', 'Rejected', 'Converted to Order', 'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const request = await CustomOrderRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('userId', 'name email phone');

  if (!request) {
    return res.status(404).json({ success: false, message: 'Custom order request not found.' });
  }

  res.json({ success: true, request });
};

module.exports = {
  submitCustomOrder,
  getMyCustomOrders,
  respondToQuote,
  checkoutCustomOrder,
  getAllCustomOrders,
  setQuote,
  updateCustomOrderStatus,
};
