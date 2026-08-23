import api from './axios';

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getDashboardAnalytics = () => api.get('/admin/dashboard/stats');
export const getCustomers = () => api.get('/admin/customers');
export const getAdminReviews = (params) => api.get('/admin/reviews', { params });
export const getAdminPendingReviews = (params) => api.get('/admin/reviews/pending', { params });
