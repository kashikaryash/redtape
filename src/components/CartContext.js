import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
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
  const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('email') || '');
  const previousUserRef = useRef(currentUserEmail);
  const cartItemsRef = useRef(cartItems);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const getUserEmail = () => localStorage.getItem('email') || '';

  const saveCartToLocalStorage = (email, items) => {
    if (email && items) {
      localStorage.setItem(`cart_${email}`, JSON.stringify(items));
    }
  };

  const loadCartFromLocalStorage = (email) => {
    if (!email) return [];
    try {
      return JSON.parse(localStorage.getItem(`cart_${email}`) || '[]');
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  };

  const getCartByUserEmail = (email) => axios.get(`${baseUrl}/cart/user/${email}`);

  const addItemToCartAPI = (email, item) =>
    axios.post(`${baseUrl}/cart/user/${email}/add`, item, {
      headers: { 'Content-Type': 'application/json' },
    });

  const updateItemQuantityAPI = (email, itemId, quantity) =>
    axios.put(`${baseUrl}/cart/user/${email}/items/${itemId}?quantity=${quantity}`);

  const removeItemFromCartAPI = (email, itemId) =>
    axios.delete(`${baseUrl}/cart/user/${email}/items/${itemId}`);

  const clearCartAPI = (email) =>
    axios.delete(`${baseUrl}/cart/user/${email}/clear`);

  const fetchCart = useCallback(async (email) => {
    if (!email) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getCartByUserEmail(email);
      if (response.data && response.data.items) {
        const items = response.data.items;
        setCartItems(items);
        const totalQuantity = items.reduce((total, item) => total + (item.quantity ?? 1), 0);
        setCartCount(totalQuantity);
        setLastUpdated(new Date());
        saveCartToLocalStorage(email, items);
      } else {
        const localCart = loadCartFromLocalStorage(email);
        setCartItems(localCart);
        setCartCount(localCart.reduce((total, item) => total + (item.quantity ?? 1), 0));
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const localCart = loadCartFromLocalStorage(email);
      setCartItems(localCart);
      setCartCount(localCart.reduce((total, item) => total + (item.quantity ?? 1), 0));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUserChange = useCallback((newEmail) => {
    const previousUser = previousUserRef.current;
    if (previousUser !== newEmail) {
      if (previousUser && cartItemsRef.current.length > 0) {
        saveCartToLocalStorage(previousUser, cartItemsRef.current);
      }
      previousUserRef.current = newEmail;
      setCurrentUserEmail(newEmail);

      if (newEmail) {
        fetchCart(newEmail);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    }
  }, [fetchCart]);

  useEffect(() => {
    const email = getUserEmail();
    if (email) {
      fetchCart(email);
    }
  }, [fetchCart]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'email') {
        const newEmail = e.newValue || '';
        setCurrentUserEmail(newEmail);
        handleUserChange(newEmail);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleUserChange]);

  useEffect(() => {
    const email = getUserEmail();
    if (email && cartItems.length > 0) {
      saveCartToLocalStorage(email, cartItems);
    }
  }, [cartItems]);

  const addToCart = async (product, quantity) => {
    const email = getUserEmail();
    if (!email) return;

    const payload = {
      modelNo: product.modelNo,
      quantity: quantity ?? 1,
    };

    try {
      await addItemToCartAPI(email, payload);
      toast.success("Added to cart");
      await fetchCart(email);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId) => {
    const email = getUserEmail();
    if (!email) return;

    try {
      await removeItemFromCartAPI(email, itemId);
      toast.info("Item removed from cart");
      await fetchCart(email);
    } catch (err) {
      console.error("Remove error:", err);
      toast.info("Item removed (local)");
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    const email = getUserEmail();
    if (!email) return;

    try {
      await updateItemQuantityAPI(email, itemId, quantity);
      await fetchCart(email);
    } catch (err) {
      console.error("Update quantity error:", err);
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    const email = getUserEmail();
    if (!email) return;

    try {
      await clearCartAPI(email);
      toast.info("Cart cleared");
      await fetchCart(email);
    } catch (err) {
      console.error("Clear cart error:", err);
      toast.info("Cart cleared (local)");
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price ?? 0) * (item.quantity ?? 0);
  }, 0);

  const isItemInCart = useCallback((modelNo) => {
    return cartItems.some(item => item.product?.modelNo === modelNo);
  }, [cartItems]);

  const getItemQuantity = useCallback((modelNo) => {
    const item = cartItems.find(item => item.product?.modelNo === modelNo);
    return item ? item.quantity ?? 0 : 0;
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
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
        refreshCart: () => fetchCart(getUserEmail()),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
