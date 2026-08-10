const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const supabase = require('../config/supabase');
const whatsapp = require('../services/whatsapp.service');

const generateInvoiceId = async () => {
  const { data } = await supabase
    .from('settings').select('invoice_prefix, invoice_counter').eq('id', 1).single();
  const prefix = data?.invoice_prefix || 'INV';
  const counter = (data?.invoice_counter || 10000) + 1;
  await supabase.from('settings').update({ invoice_counter: counter }).eq('id', 1);
  return `${prefix}-${counter}`;
};

exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, items, notes } = req.body;
  if (!items || !items.length) throw new ApiError(400, 'Order must have items');
  if (!shippingAddress) throw new ApiError(400, 'Shipping address is required');

  // Validate products and compute totals
  const productIds = items.map(i => i.product);
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, price, stock, available, product_images(url)')
    .in('id', productIds);
  if (pErr) throw new ApiError(500, pErr.message);

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find(p => p.id === item.product);
    if (!product) throw new ApiError(400, `Product not found: ${item.product}`);
    if (!product.available) throw new ApiError(400, `${product.name} is not available`);

    const qty = parseFloat(item.quantity) || 1;
    const isLoose = item.is_loose || false;
    const unit = item.unit || '';

    // For loose items, qty is weight (e.g. 1.5 kg) — only check stock if it's a whole-unit product
    if (!isLoose && product.stock < qty) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    const itemPrice = parseFloat(item.price) || product.price;
    const itemTotal = itemPrice * qty;
    subtotal += itemTotal;

    // For loose items: show "1.5 kg" label in order history
    const displayName = isLoose && unit
      ? `${product.name} (${qty} ${unit})`
      : product.name;

    orderItems.push({
      product_id: product.id,
      name: displayName,
      image: product.product_images?.[0]?.url || null,
      price: itemPrice,
      qty: qty,
      total: itemTotal,
    });
  }

  // Get delivery settings — parse as float to avoid string comparison bugs
  const { data: settings } = await supabase
    .from('settings').select('delivery_charge, free_delivery_above').eq('id', 1).single();

  // Use explicit parseFloat + safe defaults (40 charge, 499 free threshold)
  const freeDeliveryAbove = parseFloat(settings?.free_delivery_above) || 499;
  const chargePerOrder    = parseFloat(settings?.delivery_charge)     || 40;

  // If delivery_charge saved as 0 deliberately but admin likely didn't intend free forever
  // Only give free delivery when subtotal truly crosses the threshold
  const deliveryCharge = subtotal >= freeDeliveryAbove ? 0 : chargePerOrder;
  const total = subtotal + deliveryCharge;

  // Generate invoice ID
  const invoiceId = await generateInvoiceId();

  // Create the order
  const { data: order, error: oErr } = await supabase.from('orders').insert([{
    invoice_id: invoiceId,
    user_id: req.user.id,
    address: shippingAddress,
    status: 'pending_payment',
    subtotal,
    delivery_charge: deliveryCharge,
    total,
    notes,
  }]).select().single();
  if (oErr) throw new ApiError(500, oErr.message);

  // Insert order items — catch errors explicitly so we can debug
  const { error: itemsErr } = await supabase.from('order_items')
    .insert(orderItems.map(oi => ({ ...oi, order_id: order.id })));
  if (itemsErr) {
    console.error('Failed to insert order items:', itemsErr.message, JSON.stringify(orderItems));
    throw new ApiError(500, `Failed to save order items: ${itemsErr.message}`);
  }

  // Insert initial status history
  await supabase.from('order_status_history')
    .insert([{ order_id: order.id, status: 'pending_payment', note: 'Order placed' }]);

  // Reduce stock for each item
  for (const item of items) {
    const product = products.find(p => p.id === item.product);
    await supabase.from('products')
      .update({ stock: product.stock - item.quantity }).eq('id', item.product);
  }

  // Clear user's cart
  await supabase.from('cart_items').delete().eq('user_id', req.user.id);

  // Send WhatsApp notifications async (don't block response)
  const fullOrder = { ...order, items: orderItems, user: req.user };
  const { data: stg } = await supabase.from('settings').select('*').eq('id', 1).single();
  whatsapp.sendOrderConfirmationToCustomer(fullOrder, stg).catch(() => {});
  whatsapp.sendOrderAlertToOwner(fullOrder, stg).catch(() => {});

  res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const from = (page - 1) * limit;
  const to = from + parseInt(limit) - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { data, total: count, page: parseInt(page) }, 'Orders fetched'));
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('id', req.params.id)
    .single();
  if (error || !data) throw new ApiError(404, 'Order not found');
  if (req.user.role !== 'admin' && data.user_id !== req.user.id)
    throw new ApiError(403, 'Not authorized');
  res.json(new ApiResponse(200, data, 'Order fetched'));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();
  if (error) throw new ApiError(400, error.message);

  await supabase.from('order_status_history')
    .insert([{ order_id: req.params.id, status, note }]);

  // WhatsApp status notification
  const { data: user } = await supabase
    .from('users').select('phone').eq('id', data.user_id).single();
  if (user?.phone)
    whatsapp.sendStatusUpdate(user.phone, status, data.invoice_id).catch(() => {});

  res.json(new ApiResponse(200, data, 'Status updated'));
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const from = (page - 1) * limit;
  const to = from + parseInt(limit) - 1;

  let query = supabase
    .from('orders')
    .select('*, users(name, phone, email), order_items(*)', { count: 'exact' });
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { data, total: count, page: parseInt(page) }, 'All orders'));
});

exports.getOrderStats = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [
    { data: todayOrdersData }, { count: pendingOrders },
    { count: totalProducts }, { count: totalCustomers }
  ] = await Promise.all([
    supabase.from('orders').select('total, status').gte('created_at', todayStr),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending_payment'),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ]);

  const todaySales = (todayOrdersData || [])
    .filter(o => ['confirmed', 'delivered'].includes(o.status))
    .reduce((s, o) => s + parseFloat(o.total || 0), 0);

  res.json(new ApiResponse(200, {
    todaySales,
    todayOrders: (todayOrdersData || []).length,
    pendingOrders,
    totalProducts,
    totalCustomers,
  }, 'Stats fetched'));
});

exports.uploadPaymentScreenshot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { screenshot } = req.body;

  if (!screenshot) {
    throw new ApiError(400, 'Screenshot image is required');
  }

  // Update order in Supabase
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      payment_screenshot_url: screenshot,
      status: 'payment_received',
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(400, error.message);
  }

  // Insert status history
  await supabase.from('order_status_history')
    .insert([{ order_id: id, status: 'payment_received', note: 'Payment screenshot uploaded by customer' }]);

  res.json(new ApiResponse(200, data, 'Payment screenshot uploaded successfully'));
});

