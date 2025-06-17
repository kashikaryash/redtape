import axios from 'axios';
import baseUrl from '../baseUrl/baseUrl';

export const getCartByUserEmail = (email) =>
  axios.get(`${baseUrl}/cart/user/${email}`);

export const createOrUpdateCart = (cart) =>
  axios.post(`${baseUrl}/cart`, cart);

export const addItemToCart = (email, item) =>
  axios.post(`${baseUrl}/cart/user/${email}/add`, item); // item should be { modelNo, quantity }

export const updateItemQuantity = (email, modelNo, quantity) =>
  axios.put(`${baseUrl}/cart/user/${email}/items/${modelNo}`, { quantity });

export const removeItemFromCart = (email, modelNo) =>
  axios.delete(`${baseUrl}/cart/user/${email}/remove/${modelNo}`);

export const clearCart = (email) =>
  axios.delete(`${baseUrl}/cart/user/${email}/clear`);

export const getAllCartItems = (email) =>
  axios.get(`${baseUrl}/cart/user/${email}/items`);
