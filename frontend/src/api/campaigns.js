import api from './axios';

// Admin
export const getCampaigns = () => api.get('/admin/campaigns');
export const createCampaign = (formData) =>
  api.post('/admin/campaigns', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCampaign = (id, formData) =>
  api.put(`/admin/campaigns/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const togglePublishCampaign = (id) => api.patch(`/admin/campaigns/${id}/publish`);
export const deleteCampaign = (id) => api.delete(`/admin/campaigns/${id}`);

// Public
export const getPublishedCampaigns = () => api.get('/campaigns');
export const getActiveCampaigns = getPublishedCampaigns; // Alias for backwards compatibility
export const getCampaignBySlug = (slug) => api.get(`/campaigns/${slug}`);
export const getCampaign = (id) => api.get(`/campaigns/${id}`);
