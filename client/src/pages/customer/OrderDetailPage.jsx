import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOrderById, useUploadPaymentScreenshot } from '../../hooks/useOrders';
import { useCart } from '../../hooks/useCart';
import OrderTimeline from '../../components/order/OrderTimeline';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending_payment:   'bg-orange-100 text-orange-700 border-orange-200',
  payment_received:  'bg-blue-100  text-blue-700  border-blue-200',
  confirmed:         'bg-blue-100  text-blue-700  border-blue-200',
  preparing:         'bg-yellow-100 text-yellow-700 border-yellow-200',
  packed:            'bg-purple-100 text-purple-700 border-purple-200',
  out_for_delivery:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:         'bg-green-100 text-green-700 border-green-200',
  cancelled:         'bg-red-100   text-red-700   border-red-200',
};

// Simple date formatter — no external dependency needed
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export default function OrderDetailPage() {
  // ALL hooks MUST be invoked unconditionally at top level
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity } = useCart();
  const { data: orderData, isLoading } = useOrderById(id);
  const uploadScreenshot = useUploadPaymentScreenshot();

  // Backend (ApiResponse) wraps data in { data: { ...order } }
  const order = orderData?.data ?? orderData;

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Order not found</h2>
      <Link to="/orders" className="text-primary-500 hover:underline">← Back to Orders</Link>
    </div>
  );

  const handleUploadScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result;
      try {
        await uploadScreenshot.mutateAsync({ id, payload: { screenshot: base64String } });
      } catch (err) {
        console.error('Failed to upload screenshot', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Supabase field names: invoice_id, created_at, delivery_charge, total
  // order.address stores the shippingAddress object
  const address = order.address || {};
  const items   = order.order_items || order.items || [];
  const subtotal = parseFloat(order.subtotal || 0);
  const deliveryCharge = parseFloat(order.delivery_charge ?? order.deliveryCharge ?? 0);
  const totalAmount = parseFloat(order.total ?? order.totalAmount ?? subtotal + deliveryCharge);
  const invoiceId = order.invoice_id || order.invoiceId || order.id;

  const handleReorder = () => {
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
    <div className="animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Helmet>
        <title>{`Order #${invoiceId} - ${STORE_NAME}`}</title>
      </Helmet>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/orders" className="text-sm text-gray-500 hover:text-primary-500 mb-2 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 flex items-center gap-3">
            Order <span className="text-primary-600">#{invoiceId}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {formatDate(order.created_at || order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {['delivered', 'cancelled'].includes(order.status) && (
            <button
              type="button"
              onClick={handleReorder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>Reorder Items</span>
            </button>
          )}
          <span className={`px-4 py-2 rounded-full text-sm font-bold border uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="font-bold font-heading text-lg mb-6">Order Status</h3>
            <OrderTimeline status={order.status} history={order.order_status_history} />
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold font-heading text-lg">Items Ordered ({items.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => {
                const qty = item.qty ?? item.quantity ?? 1;
                const name = item.name || item.product?.name || 'Item';
                const price = parseFloat(item.price || 0);
                const imageUrl = item.image || item.product?.product_images?.[0]?.url || null;

                return (
                  <div key={index} className="p-4 sm:p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl border flex-shrink-0 flex items-center justify-center p-1">
                      {imageUrl ? (
                        <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl text-gray-300">🛒</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate ? `₹${price.toFixed(0)} × ${qty}` : ''}
                      </p>
                    </div>
                    <div className="font-bold text-gray-900 text-right">
                      ₹{(price * qty).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Payment Screenshot Section (if pending payment) */}
          {(order.status === 'pending_payment' || order.status === 'payment_received') && (
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl">
              <h3 className="font-bold text-orange-900 text-lg mb-2">Payment Verification</h3>
              <p className="text-sm text-orange-700 mb-4">
                Please upload your payment screenshot after completing the UPI transaction so the store owner can verify and confirm your order quickly.
              </p>
              
              {order.paymentScreenshot || order.payment_screenshot_url ? (
                <div className="bg-white p-4 rounded-xl border border-orange-200 inline-block">
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1 mb-2">
                    ✓ Screenshot Uploaded
                  </span>
                  <img
                    src={order.paymentScreenshot?.url || order.payment_screenshot_url}
                    alt="Payment Screenshot"
                    className="max-w-xs rounded-lg border border-gray-200"
                  />
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl cursor-pointer shadow transition-colors text-sm">
                  {uploadScreenshot.isPending ? 'Uploading...' : '📤 Upload Payment Screenshot'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadScreenshot}
                    disabled={uploadScreenshot.isPending}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="font-bold font-heading text-lg mb-4">Delivery Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">{address.fullName || address.name || ''}</p>
              <p>{address.addressLine || address.address || '—'}</p>
              {address.landmark && <p>Landmark: {address.landmark}</p>}
              <p>{address.city || ''} {address.pincode ? `- ${address.pincode}` : ''}</p>
              {address.phone && <p className="font-medium text-gray-800 mt-2">📱 +91 {address.phone}</p>}

              {(address.mapsUrl || address.maps_url || (address.latitude && address.longitude)) && (
                <a
                  href={address.mapsUrl || address.maps_url || `https://maps.google.com/?q=${address.latitude},${address.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>📍</span>
                  <span>View Delivery Map Location</span>
                </a>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="font-bold font-heading text-lg mb-4">Payment Breakdown</h3>
            <div className="space-y-3 text-sm border-b pb-4 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(0)}`}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total Paid / Payable</span>
              <span className="text-primary-600 text-lg">₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
