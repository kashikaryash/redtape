import axios from 'axios';
import baseUrl from './baseUrl';

export const createOrder = async (orderData) => {
  return await axios.post(`${baseUrl}/orders`, orderData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const getOrdersByUser = (userId) =>
  axios.get(`${baseUrl}/orders/user/${userId}`);

export const getOrderById = (orderId) =>
  axios.get(`${baseUrl}/orders/${orderId}`);

export const updateOrderStatus = (orderId, status) =>
  axios.put(`${baseUrl}/orders/${orderId}/status?status=${status}`);

export const cancelOrder = (orderId) =>
  axios.delete(`${baseUrl}/orders/${orderId}`);
