const express = require('express');
const {
  getPublishedCampaigns,
  getUpcomingCampaigns,
  getHasActiveCampaigns,
  getCampaignBySlug,
} = require('../controllers/campaignController');

const router = express.Router();

// Public routes — no auth required
router.get('/', getPublishedCampaigns);
router.get('/active', getPublishedCampaigns); // Fallback alias
router.get('/upcoming', getUpcomingCampaigns);
router.get('/has-active', getHasActiveCampaigns);
router.get('/:slug', getCampaignBySlug);

module.exports = router;
