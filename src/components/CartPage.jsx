import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const { cartItems, loading, refreshCart, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    if (refreshCart) {
      refreshCart();
    }
  }, [userEmail, navigate, refreshCart]);

  const handleRemove = async (item) => {
    try {
      await removeFromCart(item.product.modelNo); // Assuming removeFromCart takes modelNo
      toast.info('Item removed from cart');
      refreshCart();
      // updateCartCount will be handled inside context
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.info('Cart cleared');
      refreshCart();
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mt-5 text-center">
        <h3>Your cart is empty</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/allProducts')}>
          Continue Shopping
        </button>
        <ToastContainer />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mt-5">
      <h2>Your Cart</h2>
      <AnimatePresence>
        {cartItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="card mb-3"
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img src={item.product.img1} alt={item.product.name} style={{ width: '80px', marginRight: '20px' }} />
                <div>
                  <h5>{item.product.name}</h5>
                  <p className="mb-0">
                    ₹{item.product.price} x {item.quantity}
                  </p>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item)}>
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="card mt-4">
        <div className="card-body">
          <h4 className="card-title">Total: ₹{total}</h4>
          <button className="btn btn-warning" onClick={handleClear}>
            Clear Cart
          </button>
          <button className="btn btn-success ms-3" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      </div>
      <ToastContainer />
    </motion.div>
  );
}

export default CartPage;
