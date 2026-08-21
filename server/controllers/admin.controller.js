const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');
const whatsapp = require('../services/whatsapp.service');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  
  // Calculate Start of Today in Indian Standard Time (IST = UTC + 5:30)
  const istNow = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const istYear = istNow.getUTCFullYear();
  const istMonth = istNow.getUTCMonth();
  const istDate = istNow.getUTCDate();
  
  // Start of today in UTC (IST 00:00:00)
  const startOfTodayUTC = new Date(Date.UTC(istYear, istMonth, istDate) - 5.5 * 3600 * 1000);
  const weekAgoUTC = new Date(startOfTodayUTC.getTime() - 6 * 24 * 3600 * 1000);

  // 1. Fetch all orders (safely order by created_at desc)
  let allOrders = [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, invoice_id, total, status, created_at, updated_at')
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

  // Exact filtering (NO FALLBACK to allOrders)
  const todayOrdersList = allOrders.filter(o => {
    if (!o.created_at) return false;
    return new Date(o.created_at) >= startOfTodayUTC;
  });

  // Today's Sales = Non-cancelled orders created today
  const todaySales = todayOrdersList
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const todayOrders = todayOrdersList.length;

  // Pending orders = All active orders not delivered & not cancelled
  const pendingOrders = allOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  // Delivered today = Delivered orders updated/created today
  const deliveredOrders = allOrders.filter(o => {
    if (o.status !== 'delivered') return false;
    const checkDate = o.updated_at || o.created_at;
    return checkDate && new Date(checkDate) >= startOfTodayUTC;
  }).length;

  const cancelledOrders = allOrders.filter(o => {
    if (o.status !== 'cancelled') return false;
    const checkDate = o.updated_at || o.created_at;
    return checkDate && new Date(checkDate) >= startOfTodayUTC;
  }).length;

  // Total All-Time Revenue (non-cancelled)
  const totalRevenue = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  // Weekly Orders for last 7 days chart
  const weeklyOrders = allOrders.filter(o => {
    if (!o.created_at) return false;
    return new Date(o.created_at) >= weekAgoUTC;
  });

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
    weeklyOrders,
  }, 'Dashboard stats'));
});

exports.sendCustomWhatsApp = asyncHandler(async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) throw new ApiError(400, 'phone and message are required');
  await whatsapp.sendTextMessage(phone, message);
  res.json(new ApiResponse(200, {}, 'Message sent'));
});
