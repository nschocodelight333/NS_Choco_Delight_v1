require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const campaignRoutes = require('./routes/campaigns');
const customOrderRoutes = require('./routes/customOrders');

// Startup env check
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: Missing JWT_SECRET environment variable.');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

// Log 401/403/500 backend errors for monitoring
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 400) {
      console.warn(`⚠️ [${new Date().toISOString()}] HTTP ${res.statusCode} ${req.method} ${req.originalUrl} | Msg: ${body?.message || 'Error'}`);
    }
    return originalJson.call(this, body);
  };
  next();
});

// ─── Middleware ───────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];
if (process.env.FRONTEND_URL) {
  const cleanFrontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, '');
  allowedOrigins.push(cleanFrontendUrl);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    // Return exact origin string so Access-Control-Allow-Origin header matches origin for credentials: true
    return callback(null, origin);
  },
  credentials: true,
}));
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/custom-orders', customOrderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NS Choco Delight API is running' });
});

// ─── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🍫 NS Choco Delight API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

module.exports = app;
