import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getMyOrders } from '../api/orders';
import { getImageUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'online' | 'cod' | 'takeaway'
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // Collect addresses from user profile and past order history
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

  // Take away option waives delivery fee completely (Product Amount Only!)
  const deliveryFee = isTakeaway ? 0 : (cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE);
  const totalAmount = cartTotal + deliveryFee;

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    if (isTakeaway) return true; // Address not required for store pickup
    const required = ['street', 'city', 'state', 'pincode', 'phone'];
    for (const field of required) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in your ${field}`);
        return false;
      }
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Pincode must be 6 digits');
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error('Phone must be 10 digits');
      return false;
    }
    return true;
  };

  // Place order with Cash on Delivery or Takeaway
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

      const newOrder = await createOrder({
        deliveryAddress: finalAddress,
        items: items.map((i) => ({
          productId: i.product?._id || i.product,
          quantity: i.quantity,
          shape: i.shape || '',
        })),
        paymentInfo: {
          status: statusType, // 'cod' | 'takeaway'
          paymentMethod: statusType,
          razorpayOrderId: '',
          razorpayPaymentId: '',
          razorpaySignature: '',
        },
      });

      toast.success(
        statusType === 'takeaway'
          ? 'Self Pickup Order Placed! Pick up at NS Choco Delight store 🛍️'
          : 'Order placed successfully with Cash on Delivery! 🍫'
      );
      navigate(`/order-confirmation/${newOrder.data.order._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPaying(false);
    }
  };

  // Place order with Online Payment (PhonePe / Paytm / GPay / 8185920511)
  const handleOnlinePayment = async () => {
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

      const newOrder = await createOrder({
        deliveryAddress: finalAddress,
        items: items.map((i) => ({
          productId: i.product?._id || i.product,
          quantity: i.quantity,
          shape: i.shape || '',
        })),
        paymentInfo: {
          status: 'pending',
          paymentMethod: 'online',
          phone: '8185920511',
        },
      });

      toast.success('Order created! Proceeding to Payment Options... 🍫');
      navigate(`/online-payment/${newOrder.data.order._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize order. Please try again.');
      setPaying(false);
    }
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validateAddress()) return;

    if (paymentMethod === 'cod') {
      handleDirectOrder('cod');
    } else if (paymentMethod === 'takeaway') {
      handleDirectOrder('takeaway');
    } else {
      handleOnlinePayment();
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center page-container">
        <p className="text-choco-600 text-lg mb-4">Your cart is empty.</p>
        <a href="/products" className="btn-primary">
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div className="py-10 min-h-screen bg-cream/30">
      <div className="page-container max-w-5xl mx-auto">
        <h1 className="section-title mb-6">Checkout</h1>

        {/* ─── Fulfillment Type Switcher (Home Delivery vs Take Away) ─── */}
        <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 mb-8">
          <h2 className="font-display text-lg font-bold text-choco-900 mb-3">
            🛍️ Select Fulfillment Option
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                if (isTakeaway) setPaymentMethod('cod');
              }}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                !isTakeaway
                  ? 'border-choco-800 bg-choco-50/70 shadow-sm'
                  : 'border-choco-100 hover:border-choco-300 bg-white'
              }`}
            >
              <span className="text-3xl">🚚</span>
              <div>
                <p className="font-bold text-choco-900 text-sm">Home Delivery</p>
                <p className="text-xs text-choco-500 mt-0.5">
                  Delivered to your address (₹40 fee / Free on orders ≥ ₹500)
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('takeaway')}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                isTakeaway
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                  : 'border-choco-100 hover:border-choco-300 bg-white'
              }`}
            >
              <span className="text-3xl">🛍️</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-emerald-950 text-sm">Take Away (Self Pickup)</p>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    No Delivery Fee (₹0)
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Pick up at store — pay product amount only!
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ─── Delivery Address ─────────────────────── */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-choco-100 pb-3">
                <h2 className="font-display text-xl font-bold text-choco-900">
                  {isTakeaway ? '🛍️ Pickup Store Details' : '📍 Delivery Address'}
                </h2>
                {!isTakeaway && <span className="text-xs text-choco-500 font-medium">Auto-filled from Profile</span>}
              </div>

              {/* Saved Address Selection Dropdown */}
              {savedAddresses.length > 0 && !isTakeaway && (
                <div className="bg-choco-50/70 p-3.5 rounded-2xl border border-choco-200/80">
                  <label className="text-xs font-bold text-choco-800 mb-1.5 block">
                    📍 Choose Saved Address
                  </label>
                  <select
                    value={selectedSavedIdx}
                    onChange={(e) => handleSavedAddressSelect(e.target.value)}
                    className="input-field text-xs font-medium bg-white border-choco-200 shadow-2xs"
                  >
                    {savedAddresses.map((a, i) => (
                      <option key={i} value={i.toString()}>
                        {a.label}
                      </option>
                    ))}
                    <option value="new">➕ Enter a New Address</option>
                  </select>
                </div>
              )}

              {isTakeaway ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                  <span className="text-5xl block">🛍️</span>
                  <div>
                    <h3 className="font-display font-bold text-emerald-950 text-lg">
                      Store Pickup Selected
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Delivery charges are <strong>₹0 (Waived)</strong>! Only product price (₹{cartTotal}) will be charged. Pick up your fresh order directly at NS Choco Delight Store.
                    </p>
                  </div>

                  <div className="pt-2 text-left">
                    <label className="label text-xs">Mobile Number for Pickup Confirmation *</label>
                    <input
                      id="checkout-phone-takeaway"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="input-field mt-1 text-sm bg-white"
                      required
                    />
                  </div>
                </div>
              ) : (
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

          {/* ─── Order Summary + Pay ─────────────────────── */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 mb-4">
              <h2 className="font-display text-xl font-bold text-choco-900 mb-5">🛒 Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-choco-50 flex-shrink-0">
                      <img
                        src={getImageUrl(item.product?.images?.[0]) || ''}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-choco-900 truncate">{item.product?.name}</p>
                      {item.shape && <p className="text-xs text-choco-400">{item.shape} Shape</p>}
                      <p className="text-xs text-choco-500">× {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-choco-900 text-sm">₹{item.product?.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-choco-100 pt-4">
                <div className="flex justify-between text-sm text-choco-700">
                  <span>Items total</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-choco-700">
                  <span>Delivery fee</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                    {isTakeaway ? '₹0 (Take Away / Free 🎉)' : (deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-choco-900 text-xl border-t border-choco-100 pt-3 mt-2">
                  <span>Total</span>
                  <span className="font-display text-2xl">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* ─── 3 Payment Method Options ─────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 p-6 mb-4">
              <h2 className="font-display text-lg font-bold text-choco-900 mb-4">💳 Payment Method</h2>

              <div className="space-y-3">
                {/* 1. Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-choco-800 bg-choco-50/70 shadow-sm'
                      : 'border-choco-100 hover:border-choco-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-choco-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-choco-900 text-sm flex items-center gap-1.5">
                        <span>💵</span> Cash on Delivery (COD)
                      </span>
                      <span className="text-xs bg-choco-100 text-choco-800 font-bold px-2.5 py-0.5 rounded-full">
                        Pay at Doorstep
                      </span>
                    </div>
                    <p className="text-xs text-choco-500 mt-1">
                      Pay in cash when your fresh handcrafted chocolates arrive at your door
                    </p>
                  </div>
                </label>

                {/* 2. Online Payment (Pre-paid) */}
                <label
                  onClick={() => setPaymentMethod('online')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'online'
                      ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                      : 'border-choco-100 hover:border-choco-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="mt-1 accent-amber-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-choco-900 text-sm flex items-center gap-1.5">
                        <span>💳</span> Online Payment (Pre-paid)
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        Pre-paid Fast
                      </span>
                    </div>
                    <p className="text-xs text-choco-500 mt-1">
                      Pay instantly via PhonePe, Paytm, Google Pay, BHIM UPI, Cards, or Gateway
                    </p>

                    {paymentMethod === 'online' && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-xs font-bold text-choco-900">UPI Payment Number</p>
                            <p className="font-mono font-bold text-amber-950 text-base tracking-wider">8185920511</p>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <img src="/payments/phonepe.png" alt="PhonePe" className="w-5 h-5 object-contain" />
                            <img src="/payments/paytm.png" alt="Paytm" className="w-5 h-5 object-contain" />
                            <img src="/payments/gpay.png" alt="GPay" className="w-5 h-5 object-contain" />
                            <img src="/payments/navi.png" alt="Navi" className="w-5 h-5 object-contain" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* 3. Take Away Option */}
                <label
                  onClick={() => setPaymentMethod('takeaway')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'takeaway'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-choco-100 hover:border-choco-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="takeaway"
                    checked={paymentMethod === 'takeaway'}
                    onChange={() => setPaymentMethod('takeaway')}
                    className="mt-1 accent-emerald-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-choco-900 text-sm flex items-center gap-1.5">
                        <span>🛍️</span> Take Away (Self Pickup)
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        Zero Delivery Fee (₹0)
                      </span>
                    </div>
                    <p className="text-xs text-choco-500 mt-1">
                      Pick up your fresh order directly at NS Choco Delight store. Only product amount (₹{cartTotal}) charged!
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={paying}
              id="pay-now-btn"
              className="btn-gold w-full py-4 text-base text-center font-bold shadow-gold"
            >
              {paying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Processing Order...
                </span>
              ) : paymentMethod === 'online' ? (
                `💳 Pay ₹${totalAmount} via Online Pre-paid (8185920511)`
              ) : paymentMethod === 'takeaway' ? (
                `🛍️ Place Order for Take Away — Product Amount Only (₹${totalAmount})`
              ) : (
                `📦 Place Order with Cash on Delivery (₹${totalAmount})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
