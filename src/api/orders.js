import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getMyOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, orderStatus) => api.put(`/orders/${id}`, { orderStatus });
