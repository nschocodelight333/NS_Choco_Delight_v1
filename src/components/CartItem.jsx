'use client';

import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/utils/imageUrl';

const CHOCO_PLACEHOLDER = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=200&q=60';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();

  const product = item.product;
  if (!product) return null;

  const imageUrl = getImageUrl(product.images?.[0]) || CHOCO_PLACEHOLDER;
  const subtotal = product.price * item.quantity;
  const targetId = item._id || item.product?._id || item.product;

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-choco-100 items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-choco-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = CHOCO_PLACEHOLDER; }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-choco-900 text-xs sm:text-sm leading-snug line-clamp-2">
              {product.name}
            </h3>
            {item.shape && (
              <span className="text-[10px] sm:text-xs text-choco-500 mt-0.5 inline-block">
                {item.shape === 'Heart' ? '♥ Heart' : '◯ Normal'} Shape
              </span>
            )}
          </div>
          <button
            onClick={() => removeItem(targetId)}
            id={`cart-remove-${targetId}`}
            className="text-choco-400 hover:text-red-500 transition-colors p-1 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 sm:mt-3">
          <div className="flex items-center gap-1 bg-choco-50 rounded-xl p-1">
            <button
              onClick={() => updateItem(targetId, item.quantity - 1)}
              id={`cart-decrease-${targetId}`}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-choco-800 font-bold disabled:opacity-40 hover:bg-choco-100 active:scale-95 transition-all shadow-sm text-sm"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-7 text-center text-xs sm:text-sm font-semibold text-choco-900">{item.quantity}</span>
            <button
              onClick={() => updateItem(targetId, item.quantity + 1)}
              id={`cart-increase-${targetId}`}
              disabled={item.quantity >= product.stock}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-choco-800 font-bold disabled:opacity-40 hover:bg-choco-100 active:scale-95 transition-all shadow-sm text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-choco-500">₹{product.price} × {item.quantity}</p>
            <p className="font-bold text-choco-900 text-sm sm:text-base font-display">₹{subtotal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
