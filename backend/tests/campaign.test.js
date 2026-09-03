const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const connectDB = require('../config/db');

jest.setTimeout(30000);

describe('Special Occasion Campaign Pages - Status Published Sole Gate', () => {
  let draftCampaign;
  let publishedCampaign;
  let todayPublishedCampaign;
  let upcomingCampaign;
  let testProduct;

  const todayStr = new Date().toISOString().slice(0, 10);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10); // 10 days in future

  beforeAll(async () => {
    await connectDB();
    testProduct = await Product.create({
      name: 'Campaign Test Chocolate',
      description: 'Test chocolate for campaign sections',
      category: 'Normal Shape or Heart',
      price: 250,
      stock: 30,
    });

    draftCampaign = await Campaign.create({
      occasionName: 'Test Draft Occasion 🌹',
      slug: 'test-draft-occasion',
      emoji: '🌹',
      description: 'Unpublished draft tagline',
      status: 'draft',
      products: {
        special: [testProduct._id],
        hampers: [],
        customWrappers: [],
        normal: [],
      },
    });

    publishedCampaign = await Campaign.create({
      occasionName: 'Test Published Festival 🪔',
      slug: 'test-published-festival',
      emoji: '🪔',
      description: 'Live festival collection',
      status: 'published',
      products: {
        special: [testProduct._id],
        hampers: [testProduct._id],
        customWrappers: [],
        normal: [testProduct._id],
      },
    });

    todayPublishedCampaign = await Campaign.create({
      occasionName: "New Year's Day 🎉",
      slug: 'new-year-s-day-test',
      emoji: '🎉',
      description: 'New year celebration collection',
      status: 'published',
      startDate: new Date(todayStr),
    });

    upcomingCampaign = await Campaign.create({
      occasionName: 'Test Upcoming Festival 🧸',
      slug: 'test-upcoming-festival',
      emoji: '🧸',
      description: 'Upcoming festival starting soon',
      status: 'published',
      startDate: futureDate,
    });
  }, 30000);

  afterAll(async () => {
    if (draftCampaign) await Campaign.findByIdAndDelete(draftCampaign._id);
    if (publishedCampaign) await Campaign.findByIdAndDelete(publishedCampaign._id);
    if (todayPublishedCampaign) await Campaign.findByIdAndDelete(todayPublishedCampaign._id);
    if (upcomingCampaign) await Campaign.findByIdAndDelete(upcomingCampaign._id);
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    await mongoose.connection.close();
  }, 30000);

  test('Public GET /api/campaigns returns ALL published campaigns regardless of startDate/endDate', async () => {
    const res = await request(app).get('/api/campaigns');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const slugs = res.body.campaigns.map((c) => c.slug);
    expect(slugs).toContain('new-year-s-day-test');
    expect(slugs).toContain('test-published-festival');
    expect(slugs).toContain('test-upcoming-festival'); // Included because status === 'published'
    expect(slugs).not.toContain('test-draft-occasion'); // Excluded because status === 'draft'
  });

  test('Public GET /api/campaigns/has-active returns true when published campaigns exist', async () => {
    const res = await request(app).get('/api/campaigns/has-active');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hasActive).toBe(true);
  });

  test('Public GET /api/campaigns/:slug returns 404 for DRAFT campaign', async () => {
    const res = await request(app).get('/api/campaigns/test-draft-occasion');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Public GET /api/campaigns/:slug returns 200 for ANY published campaign (including future startDate)', async () => {
    const res = await request(app).get('/api/campaigns/test-upcoming-festival');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.campaign.occasionName).toBe('Test Upcoming Festival 🧸');
  });
});
