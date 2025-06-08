import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import baseUrl from '../baseUrl/baseUrl';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('email'));
  const previousUserRef = useRef(localStorage.getItem('email'));

  const getUserEmail = () => localStorage.getItem('email');

  // Save cart to local storage for persistence
  const saveCartToLocalStorage = (email, items) => {
    if (email && items) {
      localStorage.setItem(`cart_${email}`, JSON.stringify(items));
    }
  };

  // Load cart from local storage
  const loadCartFromLocalStorage = (email) => {
    if (!email) return [];
    try {
      return JSON.parse(localStorage.getItem(`cart_${email}`) || '[]');
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  };

  // API functions
  const getCartByUserEmail = (email) => axios.get(`${baseUrl}/cart/getCartByUserEmail/${email}`);
  const addItemToCartAPI = (email, item) => axios.post(`${baseUrl}/cart/${email}/items`, item);
  const updateItemQuantityAPI = (email, itemId, quantity) => axios.put(`${baseUrl}/cart/${email}/items/${itemId}?quantity=${quantity}`);
  const removeItemFromCartAPI = (email, itemId) => axios.delete(`${baseUrl}/cart/${email}/items/${itemId}`);
  const clearCartAPI = (email) => axios.delete(`${baseUrl}/cart/clearByEmail/${email}`);

  const fetchCart = useCallback(async (email) => {
    if (!email) {
      // Clear cart when no user is logged in
      setCartItems([]);
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getCartByUserEmail(email);
      if (response.data && response.data.items) {
        setCartItems(response.data.items);
        const totalQuantity = response.data.items.reduce((total, item) => total + (item.quantity || 1), 0);
        setCartCount(totalQuantity);
        setLastUpdated(new Date());
        // Save to local storage for persistence
        saveCartToLocalStorage(email, response.data.items);
      } else {
        // Load from local storage if backend has no data
        const localCart = loadCartFromLocalStorage(email);
        setCartItems(localCart);
        setCartCount(localCart.reduce((total, item) => total + (item.quantity || 1), 0));
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      console.error("Error details:", error.response?.data || error.message);

      // Fallback to local storage
      const localCart = loadCartFromLocalStorage(email);
      setCartItems(localCart);
      setCartCount(localCart.reduce((total, item) => total + (item.quantity || 1), 0));
      setLastUpdated(new Date());
      console.log("Using local cart data:", localCart);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle user changes triggered by custom events
  const handleUserChange = useCallback((newEmail) => {
    const previousUser = previousUserRef.current;

    console.log(`User change triggered: previous=${previousUser}, new=${newEmail}`);

    // If user actually changed
    if (previousUser !== newEmail) {
      // Save previous user's cart if they had items
      if (previousUser && cartItems.length > 0) {
        console.log(`Saving cart for previous user: ${previousUser}`, cartItems);
        saveCartToLocalStorage(previousUser, cartItems);
      }

      // Update refs and state
      previousUserRef.current = newEmail;
      setCurrentUserEmail(newEmail);

      // Load new user's cart
      if (newEmail) {
        console.log(`Loading cart for new user: ${newEmail}`);
        fetchCart(newEmail);
      } else {
        // No user logged in, clear cart
        console.log('No user logged in, clearing cart');
        setCartItems([]);
        setCartCount(0);
      }
    }
  }, [cartItems, fetchCart]);

  // Listen for custom user change events
  useEffect(() => {
    const handleUserChangeEvent = (event) => {
      const newEmail = event.detail.email;
      handleUserChange(newEmail);
    };

    window.addEventListener('userChanged', handleUserChangeEvent);
    return () => window.removeEventListener('userChanged', handleUserChangeEvent);
  }, [handleUserChange]);

  // Initial cart load
  useEffect(() => {
    const email = getUserEmail();
    if (email) {
      fetchCart(email);
    }
  }, [fetchCart]);

  // Listen for storage events (when localStorage changes in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'email') {
        const newEmail = e.newValue;
        console.log(`Storage change detected: email changed to ${newEmail}`);
        // Trigger re-render by updating state
        setCurrentUserEmail(newEmail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save cart data whenever cart items change
  useEffect(() => {
    const email = getUserEmail();
    if (email && cartItems.length > 0) {
      saveCartToLocalStorage(email, cartItems);
    }
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    const email = getUserEmail();
    if (!email) return toast.error("User not logged in");

    const item = {
      product: { modelNo: product.modelNo, name: product.name, price: product.price, img1: product.img1 },
      quantity: quantity,
    };

    try {
      await addItemToCartAPI(email, item);
      toast.success(`${product.name} added to cart!`);
      fetchCart(email);
    } catch (err) {
      console.error("Add to cart error:", err);
      console.error("Error details:", err.response?.data || err.message);

      // Fallback to local storage if backend fails
      try {
        const localCart = JSON.parse(localStorage.getItem(`cart_${email}`) || '[]');
        const existingItemIndex = localCart.findIndex(cartItem =>
          cartItem.product?.modelNo === product.modelNo
        );

        if (existingItemIndex >= 0) {
          localCart[existingItemIndex].quantity += quantity;
        } else {
          localCart.push(item);
        }

        saveCartToLocalStorage(email, localCart);
        setCartItems(localCart);
        setCartCount(localCart.reduce((total, item) => total + item.quantity, 0));
        toast.success(`${product.name} added to cart! (Local storage)`);
      } catch (localErr) {
        console.error("Local storage fallback failed:", localErr);
        toast.error("Failed to add to cart");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const email = getUserEmail();
    if (!email) return;

    try {
      await removeItemFromCartAPI(email, itemId);
      toast.info("Item removed from cart");
      fetchCart(email);
    } catch (err) {
      console.error("Remove error:", err);

      // Fallback to local storage
      try {
        const localCart = loadCartFromLocalStorage(email);
        const updatedCart = localCart.filter(item => item.product?.modelNo !== itemId);
        saveCartToLocalStorage(email, updatedCart);
        setCartItems(updatedCart);
        setCartCount(updatedCart.reduce((total, item) => total + item.quantity, 0));
        toast.info("Item removed from cart (Local storage)");
      } catch (localErr) {
        console.error("Local storage remove failed:", localErr);
        toast.error("Failed to remove item");
      }
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    const email = getUserEmail();
    if (!email) return;

    try {
      await updateItemQuantityAPI(email, itemId, quantity);
      fetchCart(email);
    } catch (err) {
      console.error("Quantity update error:", err);
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    const email = getUserEmail();
    if (!email) return;

    try {
      await clearCartAPI(email);
      toast.info("Cart cleared");
      fetchCart(email);
    } catch (err) {
      console.error("Clear cart error:", err);

      // Fallback to local storage
      try {
        saveCartToLocalStorage(email, []);
        setCartItems([]);
        setCartCount(0);
        toast.info("Cart cleared (Local storage)");
      } catch (localErr) {
        console.error("Local storage clear failed:", localErr);
        toast.error("Failed to clear cart");
      }
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * (item.quantity || 1);
  }, 0);

  const isItemInCart = useCallback((modelNo) => {
    return cartItems.some(item => item.product?.modelNo === modelNo);
  }, [cartItems]);

  const getItemQuantity = useCallback((modelNo) => {
    const item = cartItems.find(item => item.product?.modelNo === modelNo);
    return item ? item.quantity || 1 : 0;
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      lastUpdated,
      isItemInCart,
      getItemQuantity,
      addToCart,
      removeFromCart,
      updateItemQuantity,
      clearCart,
      refreshCart: () => fetchCart(getUserEmail())
    }}>
      {children}
    </CartContext.Provider>
  );
}
