const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get cart for logged-in user
// @route   GET /api/cart
// @access  Protected
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price images stock category shapeOptions'
  );

  if (!cart) {
    return res.json({ success: true, cart: { items: [] } });
  }

  // Filter out any items whose product reference no longer exists
  const validItems = cart.items.filter((item) => item.product != null);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  res.json({ success: true, cart });
};

// @desc    Add item to cart (or update quantity if exists)
// @route   POST /api/cart
// @access  Protected
const addToCart = async (req, res) => {
  const { productId, quantity = 1, shape = '' } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient stock.' });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, shape }],
    });
  } else {
    // Check if same product+shape combo already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.shape === shape
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, shape });
    }
    await cart.save();
  }

  await cart.populate('items.product', 'name price images stock category shapeOptions');
  res.json({ success: true, cart });
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:itemId
// @access  Protected
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  // Find item by subdocument _id OR product ID
  const itemIndex = cart.items.findIndex(
    (i) =>
      i._id?.toString() === req.params.itemId ||
      i.product?.toString() === req.params.itemId ||
      (i.product && i.product._id && i.product._id.toString() === req.params.itemId)
  );

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found in cart.' });
  }

  const item = cart.items[itemIndex];

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock.` });
    }
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name price images stock category shapeOptions');
  res.json({ success: true, cart });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Protected
const removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  // Find item by subdocument _id OR product ID
  const itemIndex = cart.items.findIndex(
    (i) =>
      i._id?.toString() === req.params.itemId ||
      i.product?.toString() === req.params.itemId ||
      (i.product && i.product._id && i.product._id.toString() === req.params.itemId)
  );

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found in cart.' });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  await cart.populate('items.product', 'name price images stock category shapeOptions');
  res.json({ success: true, cart });
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Protected
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared.' });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
