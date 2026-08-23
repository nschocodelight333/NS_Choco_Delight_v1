import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const createManualOrder = (data) => api.post('/orders/manual', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getMyOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, orderStatus) =>
  api.put(`/orders/${id}/status`, { orderStatus });
export const confirmOrderPayment = (id, data) =>
  api.put(`/orders/${id}/confirm-payment`, data);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
