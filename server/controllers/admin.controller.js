const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');
const whatsapp = require('../services/whatsapp.service');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch all orders (safely order by created_at desc)
  let allOrders = [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, invoice_id, total, status, created_at')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      allOrders = data;
    }
  } catch (e) {
    console.error('Dashboard: error fetching orders:', e);
  }

  // 2. Fetch total products count
  let totalProducts = 0;
  try {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      totalProducts = count;
    }
  } catch (e) {
    console.error('Dashboard: error fetching products count:', e);
  }

  // 3. Fetch total registered customers
  let totalCustomers = 0;
  try {
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      totalCustomers = count;
    }
  } catch (e) {
    console.error('Dashboard: error fetching users count:', e);
  }

  // 4. Fetch low stock products (stock < 10)
  let lowStockProducts = [];
  try {
    const { data: prodData } = await supabase
      .from('products')
      .select('id, name, stock, category_id')
      .lt('stock', 10)
      .limit(10);

    if (prodData && prodData.length > 0) {
      const { data: catData } = await supabase.from('categories').select('id, name');
      const catMap = {};
      (catData || []).forEach(c => { catMap[c.id] = c.name; });

      lowStockProducts = prodData.map(p => ({
        ...p,
        categories: { name: catMap[p.category_id] || 'General' }
      }));
    }
  } catch (e) {
    console.error('Dashboard: error fetching low stock products:', e);
  }

  // Filter orders for today
  const todayOrdersList = allOrders.filter(o => o.created_at && o.created_at >= startOfToday);
  const activeTodayOrders = todayOrdersList.length > 0 ? todayOrdersList : allOrders;

  // Active sales = non-cancelled orders
  const todaySales = activeTodayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const todayOrders = activeTodayOrders.length;
  const pendingOrders = allOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = allOrders.filter(o => o.status === 'cancelled').length;

  const totalRevenue = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const weeklyOrders = allOrders.filter(o => o.created_at && o.created_at >= weekAgo);

  res.json(new ApiResponse(200, {
    todaySales,
    todayOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    lowStockProducts,
    weeklyOrders: weeklyOrders.length > 0 ? weeklyOrders : allOrders,
  }, 'Dashboard stats'));
});

exports.sendCustomWhatsApp = asyncHandler(async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) throw new ApiError(400, 'phone and message are required');
  await whatsapp.sendTextMessage(phone, message);
  res.json(new ApiResponse(200, {}, 'Message sent'));
});
