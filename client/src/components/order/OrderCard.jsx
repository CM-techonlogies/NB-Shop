import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { getOrderPaymentOption } from '../../utils/whatsapp';
import Badge from '../ui/Badge';

const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};

export default function OrderCard({ order, isHistoryTab }) {
  const navigate = useNavigate();
  const { addToCart, updateQuantity } = useCart();

  const orderId     = order.id || order._id;
  const invoiceId   = order.invoice_id || order.invoiceId || orderId?.substring(0, 8).toUpperCase();
  const createdAt   = order.created_at || order.createdAt;
  const total       = parseFloat(order.total ?? order.totalAmount ?? 0);
  const items       = order.order_items || order.items || [];

  const paymentOpt  = getOrderPaymentOption(order);
  const isPickup    = paymentOpt.type === 'pickup';

  let statusLabel = 'Order Confirmed';
  let badgeVariant = 'info';

  if (order.status === 'pending_payment' || order.status === 'confirmed' || order.status === 'payment_received') {
    statusLabel = 'Order Confirmed';
    badgeVariant = 'info';
  } else if (order.status === 'preparing') {
    statusLabel = 'Preparing Order';
    badgeVariant = 'warning';
  } else if (order.status === 'packed') {
    statusLabel = isPickup ? 'Ready for Pickup 🏪' : 'Packed & Ready 📦';
    badgeVariant = isPickup ? 'warning' : 'info';
  } else if (order.status === 'out_for_delivery') {
    statusLabel = 'Out for Delivery 🛵';
    badgeVariant = 'info';
  } else if (order.status === 'delivered') {
    statusLabel = isPickup ? 'Picked Up ✅' : 'Delivered ✅';
    badgeVariant = 'success';
  } else if (order.status === 'cancelled') {
    statusLabel = 'Cancelled ❌';
    badgeVariant = 'danger';
  }

  // Reorder is ONLY visible for completed/past orders (delivered/cancelled)
  const isPastOrder = ['delivered', 'cancelled'].includes(order.status) || isHistoryTab;

  const handleReorder = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!items || items.length === 0) {
      toast.error('No items found in this order.');
      return;
    }

    let count = 0;
    items.forEach((item) => {
      const pId = item.product_id || item.product?.id || item.product || item.id || item._id;
      const pName = item.name || item.product?.name || 'Product';
      const pPrice = parseFloat(item.price || item.product?.price || 0);
      const pImage = item.image || item.product?.product_images?.[0]?.url || item.product?.image || null;
      const pQty = item.qty || item.quantity || 1;

      if (pId) {
        addToCart({
          id: pId,
          name: pName,
          price: pPrice,
          image: pImage,
          stock: item.product?.stock ?? 999,
          mrp: item.product?.mrp ?? pPrice,
        });

        if (pQty > 1) {
          updateQuantity(pId, pQty);
        }
        count++;
      }
    });

    toast.success(`Reordered ${count} items! Redirecting to cart... 🛒`);
    navigate('/cart');
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100/90 hover:shadow-md transition-all duration-200">
      {/* Top Bar: Invoice ID & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary-600 font-heading tracking-wide">
              #{invoiceId}
            </span>
            <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-lg border ${paymentOpt.color}`}>
              {paymentOpt.shortBadge}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-medium mt-0.5">
            Placed on {formatDate(createdAt)}
          </div>
        </div>
        <Badge variant={badgeVariant}>{statusLabel}</Badge>
      </div>

      {/* Items Preview List */}
      <div className="my-4 space-y-2">
        <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Order Items ({items.length})</p>
        <div className="flex flex-wrap items-center gap-2">
          {items.slice(0, 3).map((item, idx) => {
            const qty = item.qty ?? item.quantity ?? 1;
            const name = item.name || item.product?.name || 'Item';
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-xl"
              >
                <span className="text-primary-600 font-bold">{qty}x</span>
                <span className="truncate max-w-[180px]">{name}</span>
              </span>
            );
          })}
          {items.length > 3 && (
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
              +{items.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Bar: Total Price & Actions */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">Total Amount</span>
          <span className="text-lg font-black text-gray-900 font-heading">{formatPrice(total)}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {isPastOrder && (
            <button
              type="button"
              onClick={handleReorder}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-4 py-2.5 rounded-2xl text-xs border border-emerald-200/80 shadow-2xs transition-all active:scale-95"
            >
              <span>🔄</span>
              <span>Reorder</span>
            </button>
          )}

          <Link
            to={`/order/${orderId}`}
            className="inline-flex items-center gap-1 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors border border-primary-100 font-semibold"
          >
            <span>View Details</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
