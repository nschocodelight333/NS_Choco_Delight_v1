const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

// @desc    Create order (called after payment success or COD/Takeaway)
// @route   POST /api/orders
// @access  Protected
const createOrder = async (req, res) => {
  const { deliveryAddress, paymentInfo, items: reqItems } = req.body;

  // Get user cart from DB
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  // Build raw list of items (either from DB cart or from request payload fallback)
  let rawItems = [];
  if (cart && cart.items && cart.items.length > 0) {
    rawItems = cart.items.map((i) => ({
      productId: i.product?._id || i.product,
      productObj: i.product && i.product.name ? i.product : null,
      quantity: i.quantity,
      shape: i.shape || '',
    }));
  } else if (reqItems && Array.isArray(reqItems) && reqItems.length > 0) {
    rawItems = reqItems.map((i) => ({
      productId: i.productId || i.product?._id || i.product,
      quantity: i.quantity,
      shape: i.shape || '',
    }));
  }

  if (rawItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  const orderItems = [];
  for (const item of rawItems) {
    let product = item.productObj;
    if (!product || !product.stock) {
      product = await Product.findById(item.productId);
    }
    if (!product) continue;

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `${product.name} is out of stock (Available: ${product.stock}).`,
      });
    }

    product.stock -= item.quantity;
    await product.save();

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      quantity: item.quantity,
      shape: item.shape || '',
    });
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid items found in cart.' });
  }

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Take away option waives delivery fee to ₹0!
  const isTakeaway = paymentInfo?.paymentMethod === 'takeaway' || deliveryAddress?.isTakeaway;
  const deliveryFee = isTakeaway ? 0 : (itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE);
  const totalAmount = itemsTotal + deliveryFee;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    deliveryAddress,
    itemsTotal,
    deliveryFee,
    totalAmount,
    paymentInfo,
    orderStatus: paymentInfo?.status === 'paid' ? 'Confirmed' : 'Pending',
  });

  // Clear the cart in DB after order creation
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

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
    } catch (e) { /* ignore save error */ }
  }

  res.status(201).json({ success: true, order });
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Protected
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Protected
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Allow owner or admin to access
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
  }

  res.json({ success: true, order });
};

// @desc    Cancel order (if pending)
// @route   PUT /api/orders/:id/cancel
// @access  Protected
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel order in ${order.orderStatus} state.`,
    });
  }

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = 'Cancelled';
  await order.save();

  res.json({ success: true, message: 'Order cancelled successfully.', order });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
