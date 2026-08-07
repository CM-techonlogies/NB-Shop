require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { clerkMiddleware } = require('@clerk/express');

const app = express();

// CORS configuration for production & local dev
const allowedClientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedClientUrl || allowedClientUrl === '*' || origin === allowedClientUrl || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow client requests cleanly
  },
  credentials: true
}));

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(cookieParser());

// Clerk authentication middleware (attaches auth context to every request)
app.use(clerkMiddleware());

// Webhook route MUST use raw body parser - mount BEFORE express.json()
const webhookRoutes = require('./routes/webhook.routes');
app.use('/api/webhooks', webhookRoutes);

// JSON body parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const bannerRoutes = require('./routes/banner.routes');
const offerRoutes = require('./routes/offer.routes');
const settingRoutes = require('./routes/setting.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes); app.use('/auth', authRoutes);
app.use('/api/products', productRoutes); app.use('/products', productRoutes);
app.use('/api/categories', categoryRoutes); app.use('/categories', categoryRoutes);
app.use('/api/cart', cartRoutes); app.use('/cart', cartRoutes);
app.use('/api/orders', orderRoutes); app.use('/orders', orderRoutes);
app.use('/api/users', userRoutes); app.use('/users', userRoutes);
app.use('/api/banners', bannerRoutes); app.use('/banners', bannerRoutes);
app.use('/api/offers', offerRoutes); app.use('/offers', offerRoutes);
app.use('/api/settings', settingRoutes); app.use('/settings', settingRoutes);
app.use('/api/admin', adminRoutes); app.use('/admin', adminRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[${statusCode}] ${message}`, err.isOperational ? '' : err.stack);
  res.status(statusCode).json({ success: false, statusCode, message, errors: err.errors || [] });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 Kirana Store API running on http://localhost:${PORT}\n`));

// Start cron jobs
try { require('./jobs/lowStockAlert'); } catch(e) { console.warn('Cron jobs skipped:', e.message); }
