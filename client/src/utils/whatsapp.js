/**
 * WhatsApp redirect utility (wa.me / api.whatsapp.com)
 * No API token required — opens WhatsApp with a pre-filled message.
 * On mobile: opens WhatsApp app. On desktop: opens WhatsApp Web.
 */

const OWNER_PHONE = import.meta.env.VITE_OWNER_WHATSAPP || '';
const STORE_NAME  = import.meta.env.VITE_STORE_NAME || 'NB SHOP';

/**
 * Format order timestamp as "29 Jul 2026 | 11:30 PM"
 */
const formatOrderDate = (dStr) => {
  const d = dStr ? new Date(dStr) : new Date();
  try {
    const dayMonthYear = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dayMonthYear} | ${time}`;
  } catch {
    return 'Just now';
  }
};

/**
 * Build the WhatsApp URL for sending order details to the owner.
 * Works seamlessly across iOS Safari, Android Chrome, and Desktop.
 * @param {object} order   - Supabase order object (or plain order data)
 * @param {Array}  items   - cart items or order_items
 * @param {object} address - shipping address object
 * @returns {string} WhatsApp API URL with encoded message
 */
/**
 * Parse payment/pickup option from order object or notes
 */
export const getOrderPaymentOption = (order) => {
  const notes = order?.notes || '';
  const method = (order?.payment_method || order?.paymentMethod || '').toLowerCase();

  if (method === 'pickup' || /store pickup|pick up from store|pay at store/i.test(notes)) {
    return {
      type: 'pickup',
      title: 'Store Pickup',
      badge: '🏪 Confirm Order & Pick up from Store',
      shortBadge: '🏪 Store Pickup',
      detail: 'Customer will pick up packed order from store & pay (Cash/UPI) on pickup',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }

  // Extract change note if present
  const changeMatch = notes.match(/Change needed:\s*([^\]\)]+)/i) || notes.match(/Change:\s*([^\]\)]+)/i) || (order?.cod_change_note ? [null, order.cod_change_note] : null);
  const changeText = changeMatch ? changeMatch[1].trim() : null;

  return {
    type: 'cod',
    title: 'Cash on Delivery (COD)',
    badge: `💵 Cash on Delivery (COD)${changeText ? ` [Need Change: ${changeText}]` : ''}`,
    shortBadge: `💵 COD${changeText ? ` (${changeText})` : ''}`,
    changeNote: changeText,
    detail: changeText
      ? `Pay in cash on delivery (Customer requested: ${changeText})`
      : 'Pay in cash directly to delivery agent at doorstep',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
};

/**
 * Build the WhatsApp URL for sending order details to the owner.
 * Works seamlessly across iOS Safari, Android Chrome, and Desktop.
 * @param {object} order   - Supabase order object (or plain order data)
 * @param {Array}  items   - cart items or order_items
 * @param {object} address - shipping address object
 * @returns {string} WhatsApp API URL with encoded message
 */
export const buildOwnerWhatsAppUrl = (order, items = [], address = {}) => {
  const phone = (OWNER_PHONE || '').replace(/\D/g, '');
  if (!phone) return null;

  const invoiceId  = order?.invoice_id || order?.invoiceId || order?.id || '—';
  const subtotal   = parseFloat(order?.subtotal   ?? 0);
  let delivery     = parseFloat(order?.delivery_charge ?? order?.deliveryCharge ?? 0);
  if (delivery === 0 && subtotal > 0 && subtotal < 499) {
    delivery = 40;
  }
  const total = parseFloat(order?.total ?? order?.totalAmount ?? subtotal + delivery);

  const name     = address.fullName || address.name || 'Customer';
  const custPhone = (address.phone || '').replace(/\D/g, '');
  const addr     = address.addressLine || address.address || '';
  const landmark = address.landmark || '';
  const city     = address.city || '';
  const pincode  = address.pincode || '';

  const mapsUrl  = address.mapsUrl || address.maps_url || (address.latitude && address.longitude ? `https://maps.google.com/?q=${address.latitude},${address.longitude}` : null);

  const dateFormatted = formatOrderDate(order?.created_at || order?.createdAt);
  const paymentOption = getOrderPaymentOption(order);

  const itemLines = items.map((item) => {
    const isLoose = item.customQty !== undefined || item.is_loose;
    const customQty = item.customQty;
    const unit = item.unit || '';
    const qty = isLoose ? (customQty || item.quantity || item.qty || 1) : (item.qty ?? item.quantity ?? 1);
    const baseName = item.name || item.product?.name || 'Product';
    const pname = isLoose ? `${baseName} (Loose)` : baseName;
    const price = parseFloat(item.price || 0);
    const itemTotal = price * qty;

    const qtyLabel = isLoose
      ? (item.customDisplay || `${qty} ${unit}`)
      : `${qty} pcs`;

    return `• ${pname}\n  Qty : ${qtyLabel} × ₹${price.toFixed(0)} = ₹${itemTotal.toFixed(0)}`;
  }).join('\n\n');

  const locationSection = mapsUrl
    ? `\nLocation:\n${mapsUrl}`
    : '';

  const addressLines = [
    addr ? ` ${addr}` : null,
    landmark ? ` ${landmark}` : null,
    city ? ` ${city}${pincode ? ` - ${pincode}` : ''}` : pincode ? ` ${pincode}` : null
  ].filter(Boolean).join('\n');

  // Clean customer custom note (remove [Payment Mode: ...] prefix)
  const rawNotes = order?.notes || '';
  const cleanCustomerNote = rawNotes.replace(/\[Payment Mode:[^\]]+\]/gi, '').trim();

  const message =
`*${STORE_NAME}*

Order ID : *${invoiceId}*
Date : ${dateFormatted}

📦 *ORDER ITEMS*

${itemLines}

*TOTAL AMOUNT : ₹${total.toFixed(0)}*
Delivery : ${delivery === 0 ? 'FREE' : `₹${delivery.toFixed(0)}`}

*ORDER / PAYMENT OPTION*
👉 *${paymentOption.badge}*

*CUSTOMER DETAILS*

Customer : ${name}
 +91 ${custPhone}

${addressLines}
${locationSection}
${cleanCustomerNote ? `\n*Note :* ${cleanCustomerNote}` : ''}

Please prepare this order.`;

  // api.whatsapp.com/send is universally supported on iOS Safari & Android Chrome without extra HTTP 301 redirects
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
};

/**
 * Trigger WhatsApp redirect for order details.
 * Uses window.location.href instead of window.open() to bypass iOS Safari popup blockers.
 */
export const sendOrderToOwnerWhatsApp = (order, items, address) => {
  const url = buildOwnerWhatsAppUrl(order, items, address);
  if (!url) {
    console.warn('VITE_OWNER_WHATSAPP not set in .env');
    return false;
  }

  // Directly set location.href — iOS Safari allows top-level navigation inside async handlers,
  // whereas window.open() gets silently blocked by iOS popup blocker.
  window.location.href = url;
  return true;
};
