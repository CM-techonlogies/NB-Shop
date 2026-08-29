import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOrderById, useUploadPaymentScreenshot } from '../../hooks/useOrders';
import { useCart } from '../../hooks/useCart';
import OrderTimeline from '../../components/order/OrderTimeline';
import { STORE_NAME } from '../../constants';
import { sendOrderToOwnerWhatsApp, getOrderPaymentOption } from '../../utils/whatsapp';
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
  const { addToCart, addToCartWithQty, updateQuantity } = useCart();
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
    // C4 FIX: add onerror handler + toast.error on upload failure
    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.');
    };
    reader.onload = async () => {
      const base64String = reader.result;
      try {
        await uploadScreenshot.mutateAsync({ id, payload: { screenshot: base64String } });
      } catch (err) {
        toast.error('Failed to upload screenshot. Please try again.');
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
      // mn4 FIX: use is_loose field instead of fragile regex
      const pIsLoose = item.is_loose === true || item.product?.is_loose === true;
      const pCustomQty = parseFloat(item.customQty || item.custom_qty || 0);

      if (pId) {
        if (pIsLoose && pCustomQty > 0) {
          // M3 FIX: preserve customQty for loose items on reorder
          addToCartWithQty({
            id: pId,
            name: pName,
            price: pPrice,
            image: pImage,
            stock: item.product?.stock ?? 999,
            mrp: item.product?.mrp ?? pPrice,
            is_loose: true,
            unit: item.unit || item.product?.unit || 'kg',
            min_quantity: item.product?.min_quantity,
          }, pCustomQty);
        } else {
          addToCart({
            id: pId,
            name: pName,
            price: pPrice,
            image: pImage,
            stock: item.product?.stock ?? 999,
            mrp: item.product?.mrp ?? pPrice,
          });
          if (pQty > 1) updateQuantity(pId, pQty);
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
          {(() => {
            const paymentOpt = getOrderPaymentOption(order);
            const isPickup = paymentOpt.type === 'pickup';
            let label = 'Order Confirmed';
            if (order.status === 'pending_payment' || order.status === 'confirmed' || order.status === 'payment_received') {
              label = 'Order Confirmed';
            } else if (order.status === 'preparing') {
              label = 'Preparing Order';
            } else if (order.status === 'packed') {
              label = isPickup ? 'Ready for Pickup 🏪' : 'Packed & Ready 📦';
            } else if (order.status === 'out_for_delivery') {
              label = 'Out for Delivery 🛵';
            } else if (order.status === 'delivered') {
              label = isPickup ? 'Picked Up ✅' : 'Delivered ✅';
            } else if (order.status === 'cancelled') {
              label = 'Cancelled ❌';
            }
            return (
              <span className={`px-4 py-2 rounded-full text-sm font-bold border uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {label}
              </span>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="font-bold font-heading text-lg mb-6">Order Status</h3>
            <OrderTimeline order={order} status={order.status} history={order.order_status_history} />
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
                // Detect loose item: fractional qty OR name contains "(X kg/g/l/ml)"
                const isLoose = !Number.isInteger(qty) || /\(\d+(\.\d+)?\s*(kg|g|l|ml)\)/i.test(name);

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800 truncate">{name}</h4>
                        {isLoose && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap flex-shrink-0">
                            ⚖️ Loose
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{price.toFixed(0)} × {qty}
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

          {/* Payment Proof (Only if an image exists) */}
          {(order.paymentScreenshot?.url || order.payment_screenshot_url) && (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-card">
              <h3 className="font-bold text-gray-900 text-base mb-3">Payment Receipt / Proof</h3>
              <img
                src={order.paymentScreenshot?.url || order.payment_screenshot_url}
                alt="Payment Screenshot"
                className="max-w-xs rounded-xl border border-gray-200 shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">

          {/* Order & Payment Option Card */}
          {(() => {
            const paymentOption = getOrderPaymentOption(order);
            return (
              <div className="bg-white p-6 rounded-2xl shadow-card">
                <h3 className="font-bold font-heading text-lg mb-3 flex items-center justify-between">
                  <span>Selected Option</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${paymentOption.color}`}>
                    {paymentOption.type === 'pickup' ? '🏪 Store Pickup' : '💵 Cash on Delivery'}
                  </span>
                </h3>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                  <p className="text-xs font-bold text-gray-900">{paymentOption.badge}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{paymentOption.detail}</p>
                </div>
              </div>
            );
          })()}

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            {(() => {
              const paymentOption = getOrderPaymentOption(order);
              return (
                <>
                  <h3 className="font-bold font-heading text-lg mb-4">
                    {paymentOption.type === 'pickup' ? 'Pickup Information' : 'Delivery Address'}
                  </h3>
                  {paymentOption.type === 'pickup' && (
                    <div className="mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium">
                      🏪 <strong>Store Pickup Selected:</strong> You can pick up your packed items directly from the store.
                    </div>
                  )}
                </>
              );
            })()}
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

          {/* WhatsApp Direct Action Button */}
          <div className="bg-white p-6 rounded-2xl shadow-card">
            <h3 className="font-bold font-heading text-lg mb-2">Send Order to Store</h3>
            <p className="text-xs text-gray-500 mb-4">Tap below to open WhatsApp with your full order details and address.</p>
            <button
              onClick={() => sendOrderToOwnerWhatsApp(order, items, address)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="text-lg">💬</span>
              <span>Send Order on WhatsApp</span>
            </button>
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
