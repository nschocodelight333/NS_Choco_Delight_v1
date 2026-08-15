const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/choco-delightmongodb+srv://nschocoadmin:XXXX@cluster0.mbwbvuy.mongodb.net/?appName=Cluster0';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Trying fallback local database...`);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/choco-delight');
      console.log(`✅ Fallback MongoDB Connected: ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`❌ Fallback MongoDB Connection Error: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
