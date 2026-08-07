const cron = require('node-cron');
const Product = require('../models/Product');

const startLowStockAlertJob = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
      if (lowStockProducts.length > 0) {
        console.log(`Low stock alert: ${lowStockProducts.length} products have less than 10 stock.`);
      }
    } catch (error) {
      console.error('Low stock alert job failed', error);
    }
  });
};

module.exports = startLowStockAlertJob;
