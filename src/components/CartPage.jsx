import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from './CartContext';
import { useNavigate, Link } from 'react-router-dom';

function CartPage() {
  const { cartItems, loading, refreshCart, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    } else {
      refreshCart();
    }
  }, [userEmail, refreshCart, navigate]);

  const handleRemove = async (item) => {
    try {
      await removeFromCart(item.product.modelNo);
      toast.info('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.info('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="cart-page-container">
        <h1>Your Cart</h1>
        {loading ? (
          <p>Loading your cart...</p>
        ) : cartItems.length === 0 ? (
          <p>
            Your cart is empty. <Link to="/allProducts">Shop now</Link>
          </p>
        ) : (
          <>
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.product.modelNo}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  layout
                  className="cart-item"
                >
                  <img
                    src={item.product.img1}
                    alt={item.product.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <h3>{item.product.name}</h3>
                    <p>Price: ₹{item.product.price}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <button onClick={() => handleRemove(item)}>Remove</button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="cart-summary">
              <h3>Total: ₹{cartTotal.toFixed(2)}</h3>
              <button onClick={handleClear} className="clear-cart-button">
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CartPage;
