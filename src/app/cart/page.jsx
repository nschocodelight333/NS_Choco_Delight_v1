'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/CartItem';

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function CartPage() {
  const { cart, cartTotal, emptyCart } = useCart();
  const items = cart?.items || [];

  const deliveryFee = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : (cartTotal > 0 ? DELIVERY_FEE : 0);
  const totalAmount = cartTotal + deliveryFee;
  const amountToFreeDelivery = FREE_DELIVERY_THRESHOLD - cartTotal;

  if (items.length === 0) {
    return (
      <div className="py-20 page-container text-center min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-8xl block mb-6 float-animation">🛒</span>
          <h2 className="font-display text-3xl font-bold text-choco-900 mb-3">Your cart is empty</h2>
          <p className="text-choco-500 mb-8">Looks like you haven't added any chocolates yet!</p>
          <Link href="/products" id="cart-shop-now-btn" className="btn-primary text-base px-8 py-4">
            Start Shopping 🍫
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container">
        <h1 className="section-title mb-8">Your Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
            <button
              onClick={emptyCart}
              id="clear-cart-btn"
              className="text-sm text-red-500 hover:text-red-700 transition-colors mt-2"
            >
              🗑️ Clear all items
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-choco border border-choco-100 p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-choco-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-choco-700">
                  <span>Items ({items.length})</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-choco-700">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 && cartTotal > 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 && cartTotal > 0 ? '✓ Free' : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              {amountToFreeDelivery > 0 && cartTotal > 0 && (
                <div className="mb-5 p-3 bg-choco-50 rounded-xl">
                  <p className="text-xs text-choco-600 mb-2">
                    Add ₹{amountToFreeDelivery} more for free delivery!
                  </p>
                  <div className="w-full bg-choco-200 rounded-full h-1.5">
                    <div
                      className="bg-gold-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between font-bold text-choco-900 text-lg border-t border-choco-100 pt-4 mb-6">
                <span>Total</span>
                <span className="font-display text-xl">₹{totalAmount}</span>
              </div>

              <Link
                href="/checkout"
                id="proceed-to-checkout-btn"
                className="btn-primary w-full py-4 text-center text-base"
              >
                Proceed to Checkout →
              </Link>

              <Link href="/products" className="block text-center text-sm text-choco-600 hover:text-choco-900 mt-4 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
