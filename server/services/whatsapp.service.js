const axios = require('axios');

const isConfigured = () => false; // WhatsApp now handled client-side via wa.me redirect

const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
  'Content-Type': 'application/json',
});

const getBaseUrl = () =>
  `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v19.0'}/${process.env.WHATSAPP_PHONE_ID}/messages`;

const sendMessage = async (data) => {
  if (!isConfigured()) {
    console.warn('WhatsApp credentials missing, skipping message.');
    return;
  }
  try {
    await axios.post(getBaseUrl(), data, { headers: getHeaders() });
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
  }
};

const sendTextMessage = async (to, message) => {
  if (!to) return;
  // Ensure number is in international format (91XXXXXXXXXX)
  const phone = String(to).replace(/\D/g, '');
  const intlPhone = phone.startsWith('91') ? phone : `91${phone}`;
  await sendMessage({
    messaging_product: 'whatsapp',
    to: intlPhone,
    type: 'text',
    text: { body: message },
  });
};

const sendDocumentMessage = async (to, documentUrl, filename, caption) => {
  if (!to) return;
  const phone = String(to).replace(/\D/g, '');
  const intlPhone = phone.startsWith('91') ? phone : `91${phone}`;
  await sendMessage({
    messaging_product: 'whatsapp',
    to: intlPhone,
    type: 'document',
    document: { link: documentUrl, caption, filename },
  });
};

/**
 * Sent to the CUSTOMER after order placement.
 * Includes: invoice ID, items list, address, total
 */
const sendOrderConfirmationToCustomer = async (order, settings) => {
  // Support both Supabase (snake_case) and legacy (camelCase) field names
  const invoiceId  = order.invoice_id  || order.invoiceId  || order.id;
  const address    = order.address     || order.shippingAddress || {};
  const items      = order.order_items || order.items || [];
  const total      = order.total       || order.totalAmount || 0;
  const delivery   = order.delivery_charge ?? order.deliveryCharge ?? 0;
  const storeName  = settings?.store_name || settings?.storeName || process.env.STORE_NAME || 'Our Store';

  const customerName = address.fullName || address.name || 'Customer';
  const customerPhone = address.phone;

  const itemLines = items.map(item => {
    const qty   = item.qty ?? item.quantity ?? 1;
    const name  = item.name || 'Item';
    const price = parseFloat(item.price || 0);
    return `  • ${name} × ${qty} = ₹${(price * qty).toFixed(0)}`;
  }).join('\n');

  const message =
`🛍️ *Order Confirmed — ${storeName}*

Hello ${customerName}! Your order has been placed successfully.

📋 *Order ID:* ${invoiceId}

🛒 *Items:*
${itemLines}

💰 *Subtotal:* ₹${(parseFloat(total) - parseFloat(delivery)).toFixed(0)}
🚚 *Delivery:* ${parseFloat(delivery) === 0 ? 'FREE' : `₹${delivery}`}
✅ *Total to Pay:* ₹${parseFloat(total).toFixed(0)}

📍 *Delivery Address:*
${customerName}
${address.addressLine || address.address || ''}${address.landmark ? ', ' + address.landmark : ''}
${address.city || ''}${address.pincode ? ' - ' + address.pincode : ''}
📞 ${customerPhone || ''}

We'll notify you when your order is confirmed.
Thank you for shopping with us! 🙏`;

  await sendTextMessage(customerPhone, message);
};

/**
 * Sent to the STORE OWNER when a new order is placed.
 * Full details: customer info, items, address, total
 */
const sendOrderAlertToOwner = async (order, settings) => {
  const ownerPhone = process.env.OWNER_WHATSAPP;
  if (!ownerPhone) return;

  const invoiceId  = order.invoice_id  || order.invoiceId  || order.id;
  const address    = order.address     || order.shippingAddress || {};
  const items      = order.order_items || order.items || [];
  const total      = order.total       || order.totalAmount || 0;
  const delivery   = order.delivery_charge ?? order.deliveryCharge ?? 0;

  const customerName  = address.fullName || address.name || 'Customer';
  const customerPhone = address.phone || (order.user?.phone) || '—';

  const itemLines = items.map(item => {
    const qty  = item.qty ?? item.quantity ?? 1;
    const name = item.name || 'Item';
    return `  • ${name} × ${qty}`;
  }).join('\n');

  const message =
`🔔 *New Order Received!*

📋 *Invoice:* ${invoiceId}

👤 *Customer:*
Name: ${customerName}
Phone: ${customerPhone}

🛒 *Items:*
${itemLines}

💰 *Total:* ₹${parseFloat(total).toFixed(0)}
🚚 *Delivery Charge:* ${parseFloat(delivery) === 0 ? 'FREE' : `₹${delivery}`}

📍 *Deliver To:*
${address.addressLine || address.address || ''}${address.landmark ? ', Near ' + address.landmark : ''}
${address.city || ''}${address.pincode ? ' - ' + address.pincode : ''}

Please confirm and prepare the order!`;

  await sendTextMessage(ownerPhone, message);
};

/**
 * Sent to customer when order status changes
 */
const sendStatusUpdate = async (phone, status, invoiceId) => {
  const statusMessages = {
    payment_received: '✅ Your payment has been received and verified!',
    confirmed:        '✅ Your order has been confirmed by the store.',
    preparing:        '👨‍🍳 Your order is being prepared.',
    packed:           '📦 Your order is packed and ready for dispatch.',
    out_for_delivery: '🚚 Your order is out for delivery! Expect it soon.',
    delivered:        '🎉 Your order has been delivered. Enjoy!',
    cancelled:        '❌ Your order has been cancelled. Contact us if you have questions.',
  };

  const statusText = statusMessages[status] || `Status updated to: ${status}`;
  const message = `📦 *Order Update — #${invoiceId}*\n\n${statusText}\n\nThank you for shopping with us!`;
  await sendTextMessage(phone, message);
};

module.exports = {
  sendTextMessage,
  sendDocumentMessage,
  sendOrderConfirmationToCustomer,
  sendOrderAlertToOwner,
  sendStatusUpdate,
};
