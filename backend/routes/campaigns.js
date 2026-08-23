const express = require('express');
const { getPublishedCampaigns, getCampaignBySlug } = require('../controllers/campaignController');

const router = express.Router();

// Public routes — no auth required
router.get('/', getPublishedCampaigns);
router.get('/active', getPublishedCampaigns); // Fallback alias
router.get('/:slug', getCampaignBySlug);

module.exports = router;
