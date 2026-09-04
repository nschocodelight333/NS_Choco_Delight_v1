'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, getMyOrders } from '@/api/orders';
import { getImageUrl } from '@/utils/imageUrl';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const { cart, cartTotal } = useCart();
  const items = cart?.items || [];

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    phone: user?.phone || '',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const addrs = [];
    if (user?.address?.street) {
      addrs.push({
        label: `📍 Profile Default (${user.address.street}, ${user.address.city || ''})`,
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || '',
        phone: user.phone || '',
      });
    }

    getMyOrders()
      .then((res) => {
        const orders = res.data?.orders || [];
        orders.forEach((o) => {
          if (o.deliveryAddress?.street && !o.deliveryAddress.isTakeaway) {
            const exists = addrs.some(
              (a) => a.street?.toLowerCase() === o.deliveryAddress.street?.toLowerCase()
            );
            if (!exists) {
              addrs.push({
                label: `📦 Order #${o._id.slice(-6)} (${o.deliveryAddress.street}, ${o.deliveryAddress.city || ''})`,
                street: o.deliveryAddress.street || '',
                city: o.deliveryAddress.city || '',
                state: o.deliveryAddress.state || '',
                pincode: o.deliveryAddress.pincode || '',
                phone: o.deliveryAddress.phone || user?.phone || '',
              });
            }
          }
        });
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setAddress({
            street: addrs[0].street,
            city: addrs[0].city,
            state: addrs[0].state,
            pincode: addrs[0].pincode,
            phone: addrs[0].phone,
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSavedAddressSelect = (idxStr) => {
    setSelectedSavedIdx(idxStr);
    if (idxStr === 'new') {
      setAddress({ street: '', city: '', state: '', pincode: '', phone: user?.phone || '' });
    } else {
      const idx = Number(idxStr);
      if (savedAddresses[idx]) {
        const selected = savedAddresses[idx];
        setAddress({
          street: selected.street,
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode,
          phone: selected.phone || user?.phone || '',
        });
      }
    }
  };

  const isTakeaway = paymentMethod === 'takeaway';
  const deliveryFee = isTakeaway ? 0 : (cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE);
  const totalAmount = cartTotal + deliveryFee;

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    if (isTakeaway) return true;
    const required = ['street', 'city', 'state', 'pincode', 'phone'];
    for (const field of required) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in your ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleDirectOrder = async (statusType) => {
    setPaying(true);
    try {
      const finalAddress = isTakeaway
        ? {
            street: 'NS Choco Delight Store (Self Pickup)',
            city: 'Store Pickup',
            state: 'Pickup',
            pincode: '500001',
            phone: address.phone || user?.phone || '8185920511',
            isTakeaway: true,
          }
        : address;

      // Update user mobile number in profile if provided
      if (address.phone && address.phone !== user?.phone && updateUserProfile) {
        updateUserProfile({ phone: address.phone }).catch(() => {});
      }

      const newOrder = await createOrder({
        deliveryAddress: finalAddress,
        items: items.map((i) => ({
          productId: i.product?._id || i.product,
          quantity: i.quantity,
          shape: i.shape || '',
        })),
        paymentInfo: {
          status: statusType,
          paymentMethod: statusType,
        },
      });

      toast.success(
        statusType === 'takeaway'
          ? 'Self Pickup Order Placed! Pick up at NS Choco Delight store 🛍️'
          : 'Order placed successfully with Cash on Delivery! 🍫'
      );
      router.push(`/orders/${newOrder.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPaying(false);
    }
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validateAddress()) return;
    handleDirectOrder(paymentMethod);
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center page-container">
        <p className="text-choco-600 text-lg mb-4">Your cart is empty.</p>
        <button onClick={() => router.push('/products')} className="btn-primary">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 min-h-screen bg-cream/30">
      <div className="page-container max-w-5xl mx-auto">
        <h1 className="section-title mb-6">Checkout</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 mb-8">
          <h2 className="font-display text-lg font-bold text-choco-900 mb-3">
            🛍️ Select Fulfillment Option
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { if (isTakeaway) setPaymentMethod('cod'); }}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                !isTakeaway ? 'border-choco-800 bg-choco-50/70 shadow-sm' : 'border-choco-100 hover:border-choco-300 bg-white'
              }`}
            >
              <span className="text-3xl">🚚</span>
              <div>
                <p className="font-bold text-choco-900 text-sm">Home Delivery</p>
                <p className="text-xs text-choco-500 mt-0.5">Delivered to your address (₹40 fee / Free on orders ≥ ₹500)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('takeaway')}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                isTakeaway ? 'border-emerald-600 bg-emerald-50/70 shadow-sm' : 'border-choco-100 hover:border-choco-300 bg-white'
              }`}
            >
              <span className="text-3xl">🛍️</span>
              <div>
                <p className="font-bold text-emerald-950 text-sm">Take Away (Self Pickup)</p>
                <p className="text-xs text-emerald-700 mt-0.5">Pick up at store — zero delivery fee!</p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-choco-900">
                {isTakeaway ? '🛍️ Pickup Details' : '📍 Delivery Address'}
              </h2>

              {!isTakeaway && (
                <div className="space-y-4">
                  <div>
                    <label className="label" htmlFor="checkout-street">Street Address *</label>
                    <textarea
                      id="checkout-street"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      rows={2}
                      placeholder="House/Flat No., Building, Street..."
                      className="input-field resize-none text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="checkout-city">City *</label>
                      <input
                        id="checkout-city"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="checkout-state">State *</label>
                      <input
                        id="checkout-state"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="input-field text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="checkout-pincode">Pincode *</label>
                      <input
                        id="checkout-pincode"
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="checkout-phone">Phone *</label>
                      <input
                        id="checkout-phone"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 mb-4">
              <h2 className="font-display text-xl font-bold text-choco-900 mb-5">🛒 Summary</h2>
              <div className="space-y-2 border-t border-choco-100 pt-4">
                <div className="flex justify-between text-sm text-choco-700">
                  <span>Items total</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-choco-700">
                  <span>Delivery fee</span>
                  <span>{isTakeaway ? '₹0' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-choco-900 text-xl border-t border-choco-100 pt-3 mt-2">
                  <span>Total</span>
                  <span className="font-display text-2xl">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={paying}
              id="pay-now-btn"
              className="btn-gold w-full py-4 text-base text-center font-bold shadow-gold"
            >
              {paying ? 'Processing...' : `Place Order (₹${totalAmount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
