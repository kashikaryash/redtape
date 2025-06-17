import React, { useState } from 'react';
import { useCart } from "../components/CartContext";
import { motion } from 'framer-motion';
import { FaShoppingCart, FaEye, FaHeart, FaTrash } from 'react-icons/fa';

function ProductCard({ product, onViewDetails }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isItemInCart, getItemQuantity, addToCart, removeFromCart } = useCart();

  const isInCart = isItemInCart(product.modelNo);
  const itemQuantity = getItemQuantity(product.modelNo);

  const handleToggleCart = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isInCart) {
        await removeFromCart(product.modelNo);
      } else {
        await addToCart(product,1);
      }
    } catch (error) {
      console.error('🛑 Cart operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => setImageError(true);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <motion.div
      className="card h-100 shadow-sm position-relative overflow-hidden"
      whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 rounded-end" style={{ zIndex: 2 }}>
          <small className="fw-bold">{product.discount}% OFF</small>
        </div>
      )}

      {/* Cart Quantity Badge */}
      {itemQuantity > 0 && (
        <div className="position-absolute" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <span className="badge bg-success rounded-pill">
            {itemQuantity} in cart
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle p-2"
        style={{ zIndex: 2, width: '40px', height: '40px' }}
        onClick={(e) => {
          e.stopPropagation();
          console.log("❤️ Wishlist functionality goes here");
        }}
      >
        <FaHeart className="text-muted" size={14} />
      </button>

      {/* Product Image */}
      <div className="position-relative overflow-hidden" style={{ height: '350px' }}>
        {!imageError ? (
          <img
            src={product.img1}
            className="card-img-top w-100 h-100"
            alt={product.name}
            style={{ objectFit: 'contain', transition: 'transform 0.3s ease' }}
            onError={handleImageError}
            onMouseEnter={(e) => {
              if (isHovered) e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 bg-light">
            <div className="text-center text-muted">
              <FaShoppingCart size={50} className="mb-2" />
              <p>Image not available</p>
            </div>
          </div>
        )}

        {/* Quick Action Overlay */}
        <motion.div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: 'rgba(0,0,0,0.7)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <button
            className="btn btn-light me-2 rounded-circle"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            style={{ width: '50px', height: '50px' }}
          >
            <FaEye />
          </button>
          <button
            className={`btn rounded-circle ${isInCart ? 'btn-danger' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCart();
            }}
            disabled={isLoading}
            style={{ width: '50px', height: '50px' }}
          >
            {isLoading ? (
              <div className="spinner-border spinner-border-sm text-white" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : isInCart ? (
              <FaTrash />
            ) : (
              <FaShoppingCart />
            )}
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-truncate" title={product.name}>
          {product.name}
        </h5>
        <p className="card-text text-muted small text-truncate" title={product.description}>
          {product.description}
        </p>

        {/* Pricing */}
        <div className="mb-3 d-flex align-items-center gap-2">
          <span className="h5 text-success fw-bold mb-0">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-muted text-decoration-line-through small">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="badge bg-danger">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto d-grid gap-2">
          <button
            className={`btn ${isInCart ? 'btn-outline-danger' : 'btn-danger'}`}
            onClick={handleToggleCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {isInCart ? 'Removing...' : 'Adding...'}
              </>
            ) : isInCart ? (
              <>
                <FaTrash className="me-2" />
                Remove from Cart
              </>
            ) : (
              <>
                <FaShoppingCart className="me-2" />
                Add to Cart
              </>
            )}
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onViewDetails}
          >
            <FaEye className="me-1" />
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
