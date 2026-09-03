import api from './axios';

export const getDashboardStats = () => api.get('/admin/stats');
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getCustomers = () => api.get('/admin/users');
