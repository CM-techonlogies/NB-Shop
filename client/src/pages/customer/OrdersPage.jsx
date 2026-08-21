import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMyOrders } from '../../hooks/useOrders';
import OrderCard from '../../components/order/OrderCard';
import { STORE_NAME } from '../../constants';
import { Link } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';

export default function OrdersPage() {
  const { data: ordersData, isLoading, isError } = useMyOrders();
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'

  const orders = Array.isArray(ordersData)
    ? ordersData
    : (Array.isArray(ordersData?.data)
        ? ordersData.data
        : (Array.isArray(ordersData?.data?.data)
            ? ordersData.data.data
            : []));

  // Separate active/current orders vs past order history
  const currentOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders    = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const displayedOrders = activeTab === 'current' ? currentOrders : pastOrders;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Helmet>
        <title>My Orders - {STORE_NAME}</title>
      </Helmet>

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-heading text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track current deliveries and view your order history.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'current'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🚚 Current Orders {!isLoading && `(${currentOrders.length})`}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📜 Order History {!isLoading && `(${pastOrders.length})`}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/4 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="w-full h-20 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-4"></div>
              <div className="w-1/4 h-8 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* M7 FIX: show error state instead of empty state on API failure */
        <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-red-100 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Failed to load orders</h2>
          <p className="text-gray-500 text-sm mb-6">There was a problem fetching your orders. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            {activeTab === 'current' ? '🚚' : '📜'}
          </div>
          <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white mb-2">
            {activeTab === 'current' ? 'No active orders right now' : 'No order history'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            {activeTab === 'current'
              ? 'All your placed orders have been delivered! Place a new order to track delivery in real time.'
              : 'You haven\'t completed any past orders yet.'}
          </p>
          <Link
            to="/products"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-2xl shadow transition-colors text-sm"
          >
            Start Shopping Now →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map(order => (
            <OrderCard key={order.id || order._id} order={order} isHistoryTab={activeTab === 'history'} />
          ))}
        </div>
      )}
    </div>
  );
}
