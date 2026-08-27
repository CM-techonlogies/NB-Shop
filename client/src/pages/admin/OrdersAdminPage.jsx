import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supaOrders } from '../../services/supabaseAdmin';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';

const TABS = [
  { label: 'All',              value: '' },
  { label: 'Pending Payment',  value: 'pending_payment' },
  { label: 'Confirmed',        value: 'confirmed' },
  { label: 'Preparing',        value: 'preparing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered',        value: 'delivered' },
  { label: 'Cancelled',        value: 'cancelled' },
];

const STATUS_COLORS = {
  pending_payment:  'bg-orange-100 text-orange-700',
  payment_received: 'bg-blue-50   text-blue-600',
  confirmed:        'bg-blue-100  text-blue-700',
  preparing:        'bg-yellow-100 text-yellow-700',
  packed:           'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered:        'bg-green-100  text-green-700',
  cancelled:        'bg-red-100   text-red-700',
};

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};

export default function OrdersAdminPage() {
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // ── Fetch directly from Supabase (bypasses Render auth) ──────────────────
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['admin-orders', activeTab],
    queryFn: () => supaOrders.getAll(activeTab || undefined),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    // ✅ Auto-refresh every 60 seconds — new orders appear without manual reload
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const lastRefreshed = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  const orders = Array.isArray(data) ? data : [];

  // Filter orders by search term (Invoice ID, Customer Name, Phone)
  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.trim().toLowerCase();
    
    const orderId   = String(order.id || order._id || '').toLowerCase();
    const invoiceId = String(order.invoice_id || order.invoiceId || orderId).toLowerCase();
    const customer  = String(order.users?.name || order.customerName || order.address?.name || '').toLowerCase();
    const phone     = String(order.users?.phone || order.address?.phone || order.phone || '').toLowerCase();

    return (
      invoiceId.includes(query) ||
      customer.includes(query) ||
      phone.includes(query) ||
      orderId.includes(query)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet><title>Manage Orders - {STORE_NAME} Admin</title></Helmet>

      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
            View and manage customer orders
            {lastRefreshed && (
              <span className="text-xs text-gray-400">· 🕐 Updated at {lastRefreshed}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap"
          >
            🔄 Refresh
          </button>
          <div className="relative min-w-[280px] md:min-w-[360px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice # (e.g. 10051), Customer..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : isError ? (
            <p className="text-center text-red-500 py-10">Failed to load orders.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      {searchTerm.trim() ? (
                        <div>
                          <span className="text-3xl block mb-2">🔍</span>
                          <p className="font-semibold text-gray-600">No orders matching "{searchTerm}"</p>
                          <p className="text-xs text-gray-400 mt-1">Try searching by Invoice number, customer name, or phone</p>
                        </div>
                      ) : (
                        'No orders found.'
                      )}
                    </td>
                  </tr>
                ) : filteredOrders.map(order => {
                  const orderId   = order.id || order._id;
                  const invoiceId = order.invoice_id || order.invoiceId || orderId?.substring(0, 8).toUpperCase();
                  const customer  = order.users?.name || order.customerName || '—';
                  const total     = parseFloat(order.total ?? order.totalAmount ?? 0);
                  return (
                    <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-indigo-600">#{invoiceId}</td>
                      <td className="px-6 py-4 text-gray-500">{fmtDate(order.created_at || order.createdAt)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{customer}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{total.toFixed(0)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/admin/orders/${orderId}`} className="text-indigo-600 font-semibold hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
