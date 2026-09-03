'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await getCart();
      setCart(res.data.cart || { items: [] });
    } catch (err) {
      // Silent fail
    } finally {
      setCartLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1, shape = '') => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return false;
    }
    try {
      const res = await addToCart({ productId, quantity, shape });
      setCart(res.data.cart);
      toast.success('Added to cart! 🍫');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
      return false;
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await updateCartItem(itemId, { quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update cart');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await removeCartItem(itemId);
      setCart(res.data.cart);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  const emptyCart = async () => {
    try {
      await clearCart();
      setCart({ items: [] });
    } catch (err) {
      // Silent fail
    }
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  ) || 0;

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, cartCount, cartTotal, addItem, updateItem, removeItem, emptyCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
