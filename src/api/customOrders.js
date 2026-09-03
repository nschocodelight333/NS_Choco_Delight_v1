import api from './axios';

export const submitCustomOrder = (data) => api.post('/custom-orders', data);
export const getMyCustomOrders = () => api.get('/custom-orders');
export const getAllCustomOrders = () => api.get('/custom-orders');
export const getCustomOrderById = (id) => api.get(`/custom-orders/${id}`);
export const setQuote = (id, data) => api.put(`/custom-orders/${id}`, data);
export const respondToQuote = (id, action) => api.put(`/custom-orders/${id}`, { status: action });
export const checkoutCustomOrder = (id, data) => api.post(`/custom-orders/${id}/checkout`, data);
