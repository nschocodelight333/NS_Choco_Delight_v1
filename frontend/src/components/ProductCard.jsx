import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUrl';
import StarRating from './StarRating';

const CHOCO_PLACEHOLDER = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&q=80';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultShape = product.shapeOptions?.includes('Normal') ? 'Normal' : '';
    await addItem(product._id, 1, defaultShape);
  };

  const imageUrl = getImageUrl(product.images?.[0]) || CHOCO_PLACEHOLDER;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card group"
    >
      <Link to={`/products/${product._id}`} id={`product-card-${product._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-choco-50">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = CHOCO_PLACEHOLDER; }}
          />
          {/* Category Badge */}
          <span className="absolute top-3 left-3 badge bg-choco-800/80 text-cream backdrop-blur-sm text-[10px]">
            {product.category === 'Bites' ? '🍬 Bite' : '🍫 Bar'}
          </span>
          {product.isFeatured && (
            <span className="absolute top-3 right-3 badge bg-gold-gradient text-choco-900 text-[10px] shadow-gold">
              ⭐ Featured
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-choco-900/60 flex items-center justify-center">
              <span className="text-cream font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-choco-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-choco-700 transition-colors">
            {product.name}
          </h3>

          {/* Description snippet */}
          {product.description && (
            <p className="text-choco-500 text-xs leading-relaxed line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={product.ratingAverage} size="sm" />
            <span className="text-choco-500 text-xs">({product.numReviews})</span>
          </div>


          {/* Shape options */}
          {product.shapeOptions?.length > 0 && (
            <div className="flex gap-1 mb-3">
              {product.shapeOptions.map((shape) => (
                <span key={shape} className="text-[10px] px-2 py-0.5 bg-choco-50 text-choco-600 rounded-full border border-choco-200">
                  {shape === 'Heart' ? '♥' : '◯'} {shape}
                </span>
              ))}
            </div>
          )}

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold text-choco-900 font-display">₹{product.price}</span>
            <button
              onClick={handleAddToCart}
              id={`add-to-cart-${product._id}`}
              disabled={product.stock === 0}
              className="min-w-[44px] min-h-[44px] px-3 py-2.5 rounded-xl bg-choco-800 text-cream hover:bg-choco-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-choco active:scale-95 flex items-center justify-center gap-1.5 text-xs font-medium"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden xs:inline">Add</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
