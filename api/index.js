const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err.message);
  }
  return app(req, res);
};

