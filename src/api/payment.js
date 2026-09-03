import api from './axios';

export const createRazorpayOrder = (data) => api.post('/payment/create-order', data);
export const verifyRazorpayPayment = (data) => api.post('/payment/verify', data);
