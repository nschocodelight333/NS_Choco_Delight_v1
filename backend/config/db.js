const mongoose = require('mongoose');
const path = require('path');
const os = require('os');
const fs = require('fs');

let mongoMemoryServer = null;

const createFreshMongoMemoryServer = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  try {
    return await MongoMemoryServer.create({
      binary: {
        version: '6.0.14',
      },
    });
  } catch (err) {
    console.warn('⚠️ Standard MongoMemoryServer launch failed, attempting fallback version 5.0.28...', err.message);
    return await MongoMemoryServer.create({
      binary: {
        version: '5.0.28',
      },
    });
  }
};

const autoSeedDatabase = async () => {
  try {
    const { seedProducts } = require('../seed');
    const { seedAdminUser } = require('../seed-admin');
    await seedProducts(false);
    await seedAdminUser();
    console.log('🍫 Database automatically seeded with all products and admin user.');
  } catch (err) {
    console.warn('⚠️ Auto-seed note:', err.message);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  // ── Test Environment ───────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'test') {
    try {
      if (!mongoMemoryServer || !mongoMemoryServer.instanceInfo) {
        mongoMemoryServer = await createFreshMongoMemoryServer();
      }
      const memUri = mongoMemoryServer.getUri();
      const memConn = await mongoose.connect(memUri);
      console.log(`✅ Test In-Memory MongoDB Connected: ${memConn.connection.host}`);
      await autoSeedDatabase();
      return;
    } catch (err) {
      console.error('⚠️ Test MongoMemoryServer failed:', err.message);
      mongoMemoryServer = await createFreshMongoMemoryServer();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      await autoSeedDatabase();
      return;
    }
  }

  // ── Development / Production Environment ───────────────────────────────────
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/choco-delight';
  uri = uri.replace(/<([^>]+)>/g, '$1').replace(/[<>]/g, '');

  // 1. Try Cloud Atlas (or configured URI)
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await autoSeedDatabase();
    return;
  } catch (error) {
    console.error(`⚠️ Primary MongoDB connection failed: ${error.message}`);
    if (error.message.includes('bad auth')) {
      console.error('👉 For Render Cloud Deployment: Update database user password under MongoDB Atlas -> Database Access.');
    }
  }

  // 2. Try Local MongoDB Server (127.0.0.1:27017)
  const localUri = 'mongodb://127.0.0.1:27017/choco-delight';
  if (uri !== localUri && process.env.NODE_ENV !== 'production') {
    console.log('🔄 Attempting fallback to local MongoDB service...');
    try {
      const localConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
      await autoSeedDatabase();
      return;
    } catch (localErr) {
      console.error(`⚠️ Local MongoDB fallback failed: ${localErr.message}`);
    }
  }

  // 3. Fallback to In-Memory MongoDB (Guarantees app runs 100% smooth locally without installing MongoDB)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Starting In-Memory MongoDB Server for smooth local execution...');
    try {
      if (!mongoMemoryServer || !mongoMemoryServer.instanceInfo) {
        mongoMemoryServer = await createFreshMongoMemoryServer();
      }
      const memUri = mongoMemoryServer.getUri();
      const memConn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected: ${memConn.connection.host}`);
      await autoSeedDatabase();
      return;
    } catch (memErr) {
      console.error(`❌ In-Memory MongoDB failed: ${memErr.message}`);
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
};

module.exports = connectDB;