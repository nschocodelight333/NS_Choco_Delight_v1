import api from './axios';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getProductReviews = (id) => api.get(`/products/${id}/reviews`);
export const createReview = (id, data) => api.post(`/products/${id}/reviews`, data);
export const checkCanReview = (id) => api.get(`/products/${id}/can-review`);
