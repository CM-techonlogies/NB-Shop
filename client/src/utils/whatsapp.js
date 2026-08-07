/**
 * WhatsApp redirect utility (wa.me / click-to-chat)
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
 * Build the wa.me URL for sending order details to the owner.
 * @param {object} order  - Supabase order object (or plain order data)
 * @param {Array}  items  - cart items or order_items
 * @param {object} address - shipping address object
 * @returns {string} wa.me URL with encoded message
 */
export const buildOwnerWhatsAppUrl = (order, items = [], address = {}) => {
  if (!OWNER_PHONE) return null;

  const invoiceId  = order?.invoice_id || order?.invoiceId || order?.id || '—';
  const subtotal   = parseFloat(order?.subtotal   ?? 0);
  const delivery   = parseFloat(order?.delivery_charge ?? order?.deliveryCharge ?? 0);
  const total      = parseFloat(order?.total ?? order?.totalAmount ?? subtotal + delivery);

  const name     = address.fullName || address.name || 'Customer';
  const phone    = (address.phone || '').replace(/\D/g, '');
  const addr     = address.addressLine || address.address || '';
  const landmark = address.landmark || '';
  const city     = address.city || '';
  const pincode  = address.pincode || '';

  const mapsUrl  = address.mapsUrl || address.maps_url || (address.latitude && address.longitude ? `https://maps.google.com/?q=${address.latitude},${address.longitude}` : null);

  const dateFormatted = formatOrderDate(order?.created_at || order?.createdAt);

  const itemLines = items.map((item) => {
    const qty   = item.qty ?? item.quantity ?? 1;
    const pname = item.name || item.product?.name || 'Product';
    const price = parseFloat(item.price || 0);
    const itemTotal = price * qty;
    return `• ${pname}\n  Qty : ${qty} × ₹${price.toFixed(0)} = ₹${itemTotal.toFixed(0)}`;
  }).join('\n\n');

  const locationSection = mapsUrl
    ? `\nLocation:\n${mapsUrl}`
    : '';

  // Clean address lines with leading space per user template spec
  const addressLines = [
    addr ? ` ${addr}` : null,
    landmark ? ` ${landmark}` : null,
    city ? ` ${city}${pincode ? ` - ${pincode}` : ''}` : pincode ? ` ${pincode}` : null
  ].filter(Boolean).join('\n');

  const message =
`*${STORE_NAME}*

Order ID : *${invoiceId}*
Date : ${dateFormatted}

 *ORDER ITEMS*

${itemLines}

*TOTAL AMOUNT : ₹${total.toFixed(0)}*
Delivery : ${delivery === 0 ? 'FREE' : `₹${delivery.toFixed(0)}`}

*CUSTOMER DETAILS*

Customer : ${name}
 +91 ${phone}

${addressLines}
${locationSection}

Please prepare this order.`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
};

/**
 * Open WhatsApp with the order details in a new tab.
 * Returns false if owner phone is not configured.
 */
export const sendOrderToOwnerWhatsApp = (order, items, address) => {
  const url = buildOwnerWhatsAppUrl(order, items, address);
  if (!url) {
    console.warn('VITE_OWNER_WHATSAPP not set in .env');
    return false;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};
