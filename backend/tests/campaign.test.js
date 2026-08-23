const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Campaign = require('../models/Campaign');
const Product = require('../models/Product');

jest.setTimeout(30000);

describe('Special Occasion Campaign Pages - End-to-End Date & Publish Safeguards', () => {
  let draftCampaign;
  let publishedCampaign;
  let todayPublishedCampaign;
  let expiredCampaign;
  let testProduct;

  const todayStr = new Date().toISOString().slice(0, 10); // e.g. "2026-08-23"

  beforeAll(async () => {
    testProduct = await Product.create({
      name: 'Campaign Test Chocolate',
      description: 'Test chocolate for campaign sections',
      category: 'Normal Shape or Heart',
      price: 250,
      stock: 30,
    });

    draftCampaign = await Campaign.create({
      occasionName: "Test Draft Occasion 🌹",
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
      occasionName: "Test Published Festival 🪔",
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

    // Test campaign published TODAY with endDate set to today's date string
    const endDateObj = new Date(todayStr);
    endDateObj.setHours(23, 59, 59, 999);

    todayPublishedCampaign = await Campaign.create({
      occasionName: "New Year's Day 🎉",
      slug: 'new-year-s-day-test',
      emoji: '🎉',
      description: 'New year celebration collection',
      status: 'published',
      startDate: new Date(todayStr),
      endDate: endDateObj,
    });

    expiredCampaign = await Campaign.create({
      occasionName: 'Test Expired Festival',
      slug: 'test-expired-festival',
      status: 'published',
      endDate: new Date(Date.now() - 86400000), // 1 day in the past
    });
  }, 30000);

  afterAll(async () => {
    if (draftCampaign) await Campaign.findByIdAndDelete(draftCampaign._id);
    if (publishedCampaign) await Campaign.findByIdAndDelete(publishedCampaign._id);
    if (todayPublishedCampaign) await Campaign.findByIdAndDelete(todayPublishedCampaign._id);
    if (expiredCampaign) await Campaign.findByIdAndDelete(expiredCampaign._id);
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    await mongoose.connection.close();
  }, 30000);

  test('Public GET /api/campaigns returns published campaign live TODAY (endDate set to today date)', async () => {
    const res = await request(app).get('/api/campaigns');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const slugs = res.body.campaigns.map((c) => c.slug);
    expect(slugs).toContain('new-year-s-day-test');
    expect(slugs).toContain('test-published-festival');
    expect(slugs).not.toContain('test-draft-occasion');
    expect(slugs).not.toContain('test-expired-festival');
  });

  test('Public GET /api/campaigns/:slug returns 404 for DRAFT campaign', async () => {
    const res = await request(app).get('/api/campaigns/test-draft-occasion');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Public GET /api/campaigns/:slug returns 404 for EXPIRED campaign', async () => {
    const res = await request(app).get('/api/campaigns/test-expired-festival');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Public GET /api/campaigns/:slug returns 200 for campaign published TODAY', async () => {
    const res = await request(app).get('/api/campaigns/new-year-s-day-test');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.campaign.occasionName).toBe("New Year's Day 🎉");
  });
});
