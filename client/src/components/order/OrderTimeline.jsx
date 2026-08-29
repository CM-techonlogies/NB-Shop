import React from 'react';
import { formatDateTime } from '../../utils/formatDate';
import { getOrderPaymentOption } from '../../utils/whatsapp';

const DELIVERY_STATUS_ORDER = [
  'confirmed',
  'preparing',
  'packed',
  'out_for_delivery',
  'delivered',
];

const DELIVERY_STATUS_LABELS = {
  pending_payment:  { label: 'Order Confirmed',      description: 'Your order has been received & confirmed.' },
  confirmed:        { label: 'Order Confirmed',      description: 'Your order has been confirmed.' },
  preparing:        { label: 'Preparing Order',      description: 'We are packing your items.' },
  packed:           { label: 'Packed & Ready',       description: 'Order packed and ready for dispatch.' },
  out_for_delivery: { label: 'Out for Delivery 🛵',   description: 'Delivery agent is on the way to your address!' },
  delivered:        { label: 'Delivered ✅',          description: 'Order delivered successfully. Enjoy!' },
  cancelled:        { label: 'Cancelled ❌',         description: 'This order was cancelled.' },
};

const PICKUP_STATUS_ORDER = [
  'confirmed',
  'preparing',
  'packed',
  'delivered',
];

const PICKUP_STATUS_LABELS = {
  pending_payment:  { label: 'Order Confirmed',      description: 'Your order has been received & confirmed.' },
  confirmed:        { label: 'Order Confirmed',      description: 'Your order has been confirmed by the store.' },
  preparing:        { label: 'Preparing Order',      description: 'Store is packing your items.' },
  packed:           { label: 'Ready for Pickup 🏪',  description: 'Your order is packed! Please visit our store to pick up & pay.' },
  delivered:        { label: 'Picked Up & Paid ✅',   description: 'Order picked up successfully. Thank you!' },
  cancelled:        { label: 'Cancelled ❌',         description: 'This order was cancelled.' },
};

// Accepts either { order } (full order object) or { status, history } (separate props)
export default function OrderTimeline({ order, status, history }) {
  const currentStatus = order?.status ?? status ?? 'confirmed';
  const statusHistory = order?.order_status_history ?? order?.statusHistory ?? history ?? [];

  const paymentOpt = getOrderPaymentOption(order);
  const isPickup   = paymentOpt.type === 'pickup';

  const statusOrder  = isPickup ? PICKUP_STATUS_ORDER : DELIVERY_STATUS_ORDER;
  const statusLabels = isPickup ? PICKUP_STATUS_LABELS : DELIVERY_STATUS_LABELS;

  // Map legacy pending_payment to confirmed index
  let normalizedStatus = currentStatus === 'pending_payment' || currentStatus === 'payment_received'
    ? 'confirmed'
    : currentStatus;

  const currentStatusIndex = statusOrder.indexOf(normalizedStatus);

  if (currentStatus === 'cancelled') {
    return (
      <div className="py-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <span className="text-3xl block mb-2">❌</span>
          <h4 className="font-bold text-red-700 text-sm">Order Cancelled</h4>
          <p className="text-xs text-red-500 mt-1">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative pl-6">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>

        {statusOrder.map((statusKey, index) => {
          const config = statusLabels[statusKey];
          if (!config) return null;

          const isCompleted = index <= currentStatusIndex && currentStatusIndex >= 0;
          const isCurrent   = index === currentStatusIndex;
          const isFuture    = index > currentStatusIndex || currentStatusIndex < 0;

          const historyEntry = statusHistory.find(
            h => h.status === statusKey || (statusKey === 'confirmed' && h.status === 'pending_payment')
          );

          return (
            <div key={statusKey} className="relative mb-6 last:mb-0">
              <div className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white ${
                isCompleted ? 'border-green-500' : isCurrent ? 'border-primary-500' : 'border-gray-300'
              }`}>
                {isCompleted && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                {!isCompleted && isCurrent && <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>}
              </div>

              <div className="ml-4">
                <div className={`font-semibold text-sm ${
                  isCurrent ? 'text-primary-600' : isFuture ? 'text-gray-400' : 'text-gray-800'
                }`}>
                  {config.label}
                </div>
                {historyEntry && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatDateTime(historyEntry.created_at || historyEntry.timestamp)}
                  </div>
                )}
                {isCurrent && config.description && (
                  <div className="text-xs text-gray-600 mt-1 bg-primary-50 p-2 rounded-lg border border-primary-100">
                    {config.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
