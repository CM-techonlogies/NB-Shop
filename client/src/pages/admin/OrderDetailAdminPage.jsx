import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supaOrders } from '../../services/supabaseAdmin';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending_payment:  'bg-orange-100 text-orange-700 border-orange-200',
  payment_received: 'bg-blue-100  text-blue-700  border-blue-200',
  confirmed:        'bg-blue-100  text-blue-700  border-blue-200',
  preparing:        'bg-yellow-100 text-yellow-700 border-yellow-200',
  packed:           'bg-purple-100 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:        'bg-green-100  text-green-700  border-green-200',
  cancelled:        'bg-red-100    text-red-700    border-red-200',
};

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
};

export default function OrderDetailAdminPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // ── Fetch order directly from Supabase (not Render backend) ──────────────
  // This fixes "Order not found" which happened because Render backend
  // auth (Clerk) was failing — Supabase direct fetch always works.
  const { data: order, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: () => supaOrders.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    // ✅ Auto-refresh every 60 seconds to catch new status changes
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });

  // Supabase-direct status update
  const updateStatusMutation = useMutation({
    mutationFn: ({ id: orderId, status }) => supaOrders.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
      setStatusNote('');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }
  }, [order?.status]);

  // Last refreshed time
  const lastRefreshed = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order || (!order.id && !order._id)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/admin/orders" className="text-indigo-600 font-semibold hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const orderId = order.id || order._id;
  const invoiceId = order.invoice_id || order.invoiceId || orderId.substring(0, 8).toUpperCase();
  const createdAt = order.created_at || order.createdAt;

  const address = order.address || order.shippingAddress || {};
  const items = order.order_items || order.items || [];
  const history = order.order_status_history || order.statusHistory || [];

  const subtotal = parseFloat(order.subtotal ?? 0);
  const deliveryCharge = parseFloat(order.delivery_charge ?? order.deliveryCharge ?? 0);
  const total = parseFloat(order.total ?? order.totalAmount ?? subtotal + deliveryCharge);

  const customerName = address.fullName || address.name || order.users?.name || 'Customer';
  const customerPhone = address.phone || order.users?.phone || '';

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    updateStatusMutation.mutate({ id: orderId, status: selectedStatus, note: statusNote });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fadeIn">
      <Helmet>
        <title>{`Order #${invoiceId} - ${STORE_NAME} Admin`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/orders"
            className="text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order <span className="text-indigo-600">#{invoiceId}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {fmtDate(createdAt)}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-gray-400 font-medium">
              🕐 Updated at {lastRefreshed}
            </span>
          )}
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all active:scale-95"
          >
            🔄 Refresh
          </button>
          <span
            className={`px-4 py-2 rounded-full text-xs font-bold border uppercase tracking-wider ${
              STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left / Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status Update Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Update Order Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="packed">Packed</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Out for delivery with delivery agent Ramesh"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </form>
          </div>

          {/* Items Ordered */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800 text-sm">
              Items Ordered ({items.length})
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => {
                const imageUrl = item.image || item.product?.product_images?.[0]?.url || null;
                const itemName = item.name || item.product?.name || 'Product';
                const qty      = item.qty ?? item.quantity ?? 1;
                const price    = parseFloat(item.price || 0);
                // Detect loose item: fractional qty OR name contains "(X kg/g/l/ml)"
                const isLoose  = !Number.isInteger(qty) || /\(\d+(\.\d+)?\s*(kg|g|l|ml)\)/i.test(itemName);

                return (
                  <div key={item.id || item._id || idx} className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl border p-1 flex-shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={itemName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl">🛒</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{itemName}</h4>
                        {isLoose && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap flex-shrink-0">
                            ⚖️ Loose
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {qty} × ₹{price.toFixed(0)}
                      </p>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">
                      ₹{(price * qty).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Timeline History */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Status History</h3>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start justify-between text-xs border-l-2 border-indigo-500 pl-3 py-1">
                    <div>
                      <p className="font-bold text-gray-800 uppercase tracking-wide">
                        {h.status?.replace(/_/g, ' ')}
                      </p>
                      {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                    </div>
                    <span className="text-gray-400 font-medium whitespace-nowrap">
                      {fmtDate(h.created_at || h.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Screenshot */}
          {(order.paymentScreenshot || order.payment_screenshot_url) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 mb-3">Payment Screenshot</h3>
              <a
                href={order.paymentScreenshot?.url || order.payment_screenshot_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block group"
              >
                <img
                  src={order.paymentScreenshot?.url || order.payment_screenshot_url}
                  alt="Payment Screenshot"
                  className="max-w-xs rounded-xl border border-gray-200 shadow-xs group-hover:opacity-90 transition-opacity"
                />
                <span className="text-xs text-indigo-600 font-bold block mt-2">
                  Click to view full image →
                </span>
              </a>
            </div>
          )}

        </div>

        {/* Right / Sidebar Column */}
        <div className="space-y-6">

          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Customer Details</h3>
            <div className="text-xs text-gray-600 space-y-1.5">
              <p className="font-bold text-gray-900 text-sm">{customerName}</p>
              {customerPhone && <p className="font-medium">+91 {customerPhone}</p>}
              {customerPhone && (
                <a
                  href={`https://wa.me/91${customerPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs"
                >
                  💬 Chat on WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Shipping Address</h3>
            <div className="text-xs text-gray-600 space-y-1 font-medium">
              <p className="font-bold text-gray-800">{address.fullName || address.name || ''}</p>
              <p>{address.addressLine || address.address || '—'}</p>
              {address.landmark && <p>Landmark: {address.landmark}</p>}
              <p>
                {address.city || ''}
                {address.pincode ? ` - ${address.pincode}` : ''}
              </p>
              {order.notes && (
                <div className="mt-3 p-2.5 bg-orange-50 rounded-xl border border-orange-100 text-orange-800">
                  <p className="font-bold text-[11px] uppercase tracking-wide">Delivery Notes:</p>
                  <p className="text-xs mt-0.5">{order.notes}</p>
                </div>
              )}

              {(address.mapsUrl || address.maps_url || (address.latitude && address.longitude)) && (
                <a
                  href={address.mapsUrl || address.maps_url || `https://maps.google.com/?q=${address.latitude},${address.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>🗺️</span>
                  <span>Open GPS Location in Google Maps</span>
                </a>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Delivery Charge</span>
                {deliveryCharge === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span>₹{deliveryCharge.toFixed(0)}</span>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base text-gray-900">
                <span>Total Amount</span>
                <span className="text-indigo-600">₹{total.toFixed(0)}</span>
              </div>
            </div>

            {order.invoice_url && (
              <a
                href={order.invoice_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl transition-colors text-xs"
              >
                📄 Download Invoice
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
