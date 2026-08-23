const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  shape: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return this.orderSource === 'website';
      },
    },
    orderSource: {
      type: String,
      enum: ['website', 'whatsapp'],
      default: 'website',
    },
    guestCustomer: {
      name: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
    },
    items: [orderItemSchema],
    deliveryAddress: {
      street: {
        type: String,
        required: function() {
          return this.orderSource === 'website';
        },
      },
      city: {
        type: String,
        required: function() {
          return this.orderSource === 'website';
        },
      },
      state: {
        type: String,
        required: function() {
          return this.orderSource === 'website';
        },
      },
      pincode: {
        type: String,
        required: function() {
          return this.orderSource === 'website';
        },
      },
      phone: {
        type: String,
        required: function() {
          return this.orderSource === 'website';
        },
      },
    },
    itemsTotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentInfo: {
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cod'],
        default: 'pending',
      },
    },
    notes: {
      type: String,
      default: '',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Prepared', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
