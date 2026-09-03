import api from './axios';

export const getCampaigns = () => api.get('/campaigns?all=true');
export const getPublishedCampaigns = () => api.get('/campaigns');
export const getActiveCampaigns = getPublishedCampaigns;
export const getCampaignBySlug = (slug) => api.get(`/campaigns/${slug}`);
export const createCampaign = (data) => api.post('/campaigns', data);
export const updateCampaign = (slug, data) => api.put(`/campaigns/${slug}`, data);
export const deleteCampaign = (slug) => api.delete(`/campaigns/${slug}`);
