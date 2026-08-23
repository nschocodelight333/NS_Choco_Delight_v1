const Campaign = require('../models/Campaign');
const cloudinary = require('../config/cloudinary');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ─── Helpers: File URL Formatter ──────────────────────────────────────────────
const getFileUrl = (file) => {
  if (!file) return '';
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  return `/uploads/${file.filename}`;
};

// ─── Helpers: Parse Dates ───────────────────────────────────────────────────
const parseStartDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseEndDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  // Set to end of day: 23:59:59.999
  d.setHours(23, 59, 59, 999);
  return d;
};

// ─── Helper: Parse Products Object ───────────────────────────────────────────
const parseProductsCategoryObject = (productsInput) => {
  if (!productsInput) {
    return { special: [], hampers: [], customWrappers: [], normal: [] };
  }
  let parsed = typeof productsInput === 'string' ? JSON.parse(productsInput) : productsInput;
  if (Array.isArray(parsed)) {
    return { special: parsed, hampers: [], customWrappers: [], normal: [] };
  }
  return {
    special: Array.isArray(parsed.special) ? parsed.special : [],
    hampers: Array.isArray(parsed.hampers) ? parsed.hampers : [],
    customWrappers: Array.isArray(parsed.customWrappers) ? parsed.customWrappers : [],
    normal: Array.isArray(parsed.normal) ? parsed.normal : [],
  };
};

// ─── Helper: Parse Theme Colors ──────────────────────────────────────────────
const parseThemeColors = (colorsInput) => {
  if (!colorsInput) {
    return { primary: '#7C2D12', secondary: '#D97706', background: '#FFFBEB' };
  }
  let parsed = typeof colorsInput === 'string' ? JSON.parse(colorsInput) : colorsInput;
  return {
    primary: parsed.primary || '#7C2D12',
    secondary: parsed.secondary || '#D97706',
    background: parsed.background || '#FFFBEB',
  };
};

// ─── Admin: Create Campaign ───────────────────────────────────────────────────
// @route POST /api/admin/campaigns
const createCampaign = async (req, res) => {
  const {
    occasionName,
    slug: inputSlug,
    emoji,
    themeColors,
    description,
    startDate,
    endDate,
    status,
    products,
  } = req.body;

  if (!occasionName || !occasionName.trim()) {
    return res.status(400).json({ success: false, message: 'Occasion name is required' });
  }

  // Generate unique slug
  let slug = inputSlug ? slugify(inputSlug) : slugify(occasionName);
  let existingSlug = await Campaign.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  // Banner image handling
  const bannerImageUrl = req.file ? getFileUrl(req.file) : (req.body.bannerImageUrl || '');

  const parsedProducts = parseProductsCategoryObject(products);
  const parsedTheme = parseThemeColors(themeColors);

  const campaign = await Campaign.create({
    occasionName: occasionName.trim(),
    slug,
    emoji: emoji || '🎉',
    themeColors: parsedTheme,
    bannerImageUrl,
    description: description || '',
    startDate: parseStartDate(startDate),
    endDate: parseEndDate(endDate),
    status: status && ['draft', 'published', 'archived'].includes(status) ? status : 'draft',
    products: parsedProducts,
  });

  await campaign.populate([
    { path: 'products.special', select: 'name price images category isAvailable' },
    { path: 'products.hampers', select: 'name price images category isAvailable' },
    { path: 'products.customWrappers', select: 'name price images category isAvailable' },
    { path: 'products.normal', select: 'name price images category isAvailable' },
    { path: 'products', select: 'name price images category isAvailable' },
  ]);

  res.status(201).json({ success: true, campaign });
};

// ─── Admin: Update Campaign ───────────────────────────────────────────────────
// @route PUT /api/admin/campaigns/:id
const updateCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  const {
    occasionName,
    slug: inputSlug,
    emoji,
    themeColors,
    description,
    startDate,
    endDate,
    status,
    products,
    removeBanner,
  } = req.body;

  if (occasionName && occasionName.trim()) {
    campaign.occasionName = occasionName.trim();
    if (!inputSlug) {
      campaign.slug = slugify(occasionName.trim());
    }
  }

  if (inputSlug && inputSlug.trim()) {
    campaign.slug = slugify(inputSlug.trim());
  }

  if (emoji) campaign.emoji = emoji;
  if (themeColors) campaign.themeColors = parseThemeColors(themeColors);
  if (description !== undefined) campaign.description = description;
  if (startDate !== undefined) campaign.startDate = parseStartDate(startDate);
  if (endDate !== undefined) campaign.endDate = parseEndDate(endDate);
  if (status && ['draft', 'published', 'archived'].includes(status)) campaign.status = status;

  if (products !== undefined) {
    campaign.products = parseProductsCategoryObject(products);
  }

  // Handle new banner image upload
  if (req.file) {
    if (campaign.bannerImageUrl && campaign.bannerImageUrl.includes('cloudinary')) {
      try {
        const publicId = campaign.bannerImageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) { /* ignore */ }
    }
    campaign.bannerImageUrl = getFileUrl(req.file);
  }

  if (removeBanner === 'true' && campaign.bannerImageUrl) {
    if (campaign.bannerImageUrl.includes('cloudinary')) {
      try {
        const publicId = campaign.bannerImageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) { /* ignore */ }
    }
    campaign.bannerImageUrl = '';
  }

  await campaign.save();
  await campaign.populate([
    { path: 'products.special', select: 'name price images category isAvailable' },
    { path: 'products.hampers', select: 'name price images category isAvailable' },
    { path: 'products.customWrappers', select: 'name price images category isAvailable' },
    { path: 'products.normal', select: 'name price images category isAvailable' },
    { path: 'products', select: 'name price images category isAvailable' },
  ]);

  res.json({ success: true, campaign });
};

// ─── Admin: Quick Toggle Publish Status ───────────────────────────────────────
// @route PATCH /api/admin/campaigns/:id/publish
const togglePublishStatus = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  campaign.status = campaign.status === 'published' ? 'draft' : 'published';
  await campaign.save();

  res.json({ success: true, status: campaign.status, campaign });
};

// ─── Admin: Delete / Archive Campaign ────────────────────────────────────────
// @route DELETE /api/admin/campaigns/:id
const deleteCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found' });
  }

  if (campaign.bannerImageUrl && campaign.bannerImageUrl.includes('cloudinary')) {
    try {
      const publicId = campaign.bannerImageUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (e) { /* ignore */ }
  }

  await campaign.deleteOne();
  res.json({ success: true, message: 'Campaign deleted.' });
};

// ─── Admin: List All Campaigns (Any Status) ──────────────────────────────────
// @route GET /api/admin/campaigns
const getAllCampaigns = async (req, res) => {
  const campaigns = await Campaign.find()
    .populate([
      { path: 'products.special', select: 'name price images category' },
      { path: 'products.hampers', select: 'name price images category' },
      { path: 'products.customWrappers', select: 'name price images category' },
      { path: 'products.normal', select: 'name price images category' },
      { path: 'products', select: 'name price images category' },
    ])
    .sort({ createdAt: -1 });

  res.json({ success: true, campaigns });
};

// ─── Public: Get Active Published Campaigns ───────────────────────────────────
// @route GET /api/campaigns
const getPublishedCampaigns = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const campaigns = await Campaign.find({
      status: 'published',
      $or: [{ endDate: null }, { endDate: { $gte: startOfToday } }],
    })
      .populate([
        { path: 'products.special', select: 'name price images category isAvailable' },
        { path: 'products.hampers', select: 'name price images category' },
        { path: 'products.customWrappers', select: 'name price images category' },
        { path: 'products.normal', select: 'name price images category' },
        { path: 'products', select: 'name price images category isAvailable' },
      ])
      .sort({ createdAt: -1 });

    res.json({ success: true, campaigns });
  } catch (err) {
    console.error('Error fetching published campaigns:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
};

// ─── Public: Get Campaign by Slug (Strict 404 for Draft/Expired) ─────────────
// @route GET /api/campaigns/:slug
const getCampaignBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const campaign = await Campaign.findOne({ slug })
      .populate([
        { path: 'products.special', select: 'name price images category description ratingAverage isAvailable' },
        { path: 'products.hampers', select: 'name price images category description ratingAverage isAvailable' },
        { path: 'products.customWrappers', select: 'name price images category description ratingAverage isAvailable' },
        { path: 'products.normal', select: 'name price images category description ratingAverage isAvailable' },
        { path: 'products', select: 'name price images category description ratingAverage isAvailable' },
      ]);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // STRICT CHECK: Only published and non-expired allowed for public
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (campaign.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Campaign is not published' });
    }

    if (campaign.endDate && campaign.endDate < startOfToday) {
      return res.status(404).json({ success: false, message: 'Campaign has expired' });
    }

    res.json({ success: true, campaign });
  } catch (err) {
    console.error('Error fetching campaign by slug:', err);
    res.status(500).json({ success: false, message: 'Failed to load campaign' });
  }
};

module.exports = {
  createCampaign,
  updateCampaign,
  togglePublishStatus,
  deleteCampaign,
  getAllCampaigns,
  getPublishedCampaigns,
  getCampaignBySlug,
};
