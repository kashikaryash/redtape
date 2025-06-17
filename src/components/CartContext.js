import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import baseUrl from "../baseUrl/baseUrl";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem("email");

 const refreshCart = useCallback(async () => {
  if (!email) return;
  try {
    setLoading(true);
    const res = await axios.get(`${baseUrl}/cart/user/${email}`);
    const rawItems = res.data?.items || [];
    const cleanedItems = rawItems.map(item => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
    }));
    setCartItems(cleanedItems);
  } catch (err) {
    console.error("Error fetching cart:", err);
    setCartItems([]);
  } finally {
    setLoading(false);
  }
}, [email]);


  useEffect(() => {
  refreshCart();
}, [refreshCart]);


  const addToCart = async (product, quantity) => {
    try {
      await axios.post(`${baseUrl}/cart/user/${email}/add`, {
        modelNo: product.modelNo,
        quantity,
      });
      await refreshCart();
    } catch (error) {
      console.error("\u274C Failed to add to cart:", error.response?.data || error.message);
      throw error;
    }
  };

  const removeFromCart = async (modelNo) => {
    try {
      await axios.delete(`${baseUrl}/cart/user/${email}/remove/${modelNo}`);
      await refreshCart();
    } catch (error) {
      console.error("\u274C Failed to remove item:", error.response?.data || error.message);
    }
  };

  const updateItemQuantity = async (modelNo, newQuantity) => {
    try {
      await axios.put(`${baseUrl}/cart/user/${email}/items/${modelNo}`, {
        quantity: newQuantity,
      });
      await refreshCart();
    } catch (error) {
      console.error("\u274C Failed to update quantity:", error.response?.data || error.message);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${baseUrl}/cart/user/${email}/clear`);
      await refreshCart();
    } catch (error) {
      console.error("\u274C Failed to clear cart:", error.response?.data || error.message);
    }
  };

  const getItemQuantity = (modelNo) => {
    const item = cartItems.find((item) => item?.product?.modelNo === modelNo);
    return item?.quantity || 0;
  };

  const isItemInCart = (modelNo) => {
    return cartItems?.some((item) => item?.product?.modelNo === modelNo);
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item?.product?.price || 0;
    const qty = item?.quantity || 0;
    return sum + price * qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateItemQuantity,
        isItemInCart,
        getItemQuantity,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
