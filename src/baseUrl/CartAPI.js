import axios from 'axios';
import baseUrl from './baseUrl';

export const getCartByUserEmail = (email) =>
  axios.get(`${baseUrl}/cart/getCartByUserEmail/${email}`);

export const createOrUpdateCart = (cart) =>
  axios.post(`${baseUrl}/cart/createOrUpdateCart`, cart);

export const getAllCartItems = (email) =>
  axios.get(`${baseUrl}/cart/${email}/items`);

export const addItemToCart = (email, item) =>
  axios.post(`${baseUrl}/cart/${email}/items`, item);

export const removeItemFromCart = (email, itemId) =>
  axios.delete(`${baseUrl}/cart/${email}/items/${itemId}`);

export const clearCart = (email) =>
  axios.delete(`${baseUrl}/cart/clearByEmail/${email}`);
