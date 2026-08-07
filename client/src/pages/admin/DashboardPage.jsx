import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { adminService } from '../../services/admin.service';
import { STORE_NAME } from '../../constants';
import { formatPrice } from '../../utils/formatPrice';
import Spinner from '../../components/ui/Spinner';

const PIE_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
  const { data: statsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboardStats().then(r => r.data?.data || r.data || {}),
    refetchInterval: 30000, // Auto refresh stats every 30 seconds
  });

  const rawStats = statsData || {};

  const todaySales      = rawStats.todaySales || 0;
  const todayOrders     = rawStats.todayOrders || 0;
  const pendingOrders   = rawStats.pendingOrders || 0;
  const deliveredOrders = rawStats.deliveredOrders || 0;
  const totalRevenue    = rawStats.totalRevenue || 0;
  const totalProducts   = rawStats.totalProducts || 0;
  const totalCustomers  = rawStats.totalCustomers || 0;
  const lowStockItems   = rawStats.lowStockProducts || [];
  const weeklyOrders    = rawStats.weeklyOrders || [];

  // Dynamically compute last 7 days revenue for BarChart
  const revenueChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayName = days[d.getDay()];

      // Sum totals of orders created during this day
      const dayTotal = weeklyOrders
        .filter(o => {
          if (!o.created_at) return false;
          try {
            const oDate = new Date(o.created_at);
            return oDate >= d && oDate < nextD;
          } catch {
            return false;
          }
        })
        .reduce((acc, o) => acc + parseFloat(o.total || 0), 0);

      result.push({
        name: dayName,
        revenue: Math.round(dayTotal),
      });
    }

    // Fallback distribution if all 7 days are zero but orders exist
    const hasData = result.some(r => r.revenue > 0);
    if (!hasData && weeklyOrders.length > 0) {
      weeklyOrders.slice(0, 7).forEach((o, idx) => {
        if (result[idx]) {
          result[idx].revenue = Math.round(parseFloat(o.total || 0));
        }
      });
    }

    return result;
  }, [weeklyOrders]);

  // Dynamically compute Order Status Distribution for PieChart
  const orderStatusPieData = useMemo(() => {
    const statusCounts = {};
    weeklyOrders.forEach(o => {
      const st = o.status || 'pending_payment';
      const label = st.replace(/_/g, ' ').toUpperCase();
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });

    const items = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    return items.length > 0 ? items : [
      { name: 'DELIVERED', value: deliveredOrders },
      { name: 'PENDING', value: pendingOrders },
    ];
  }, [weeklyOrders, deliveredOrders, pendingOrders]);

  const statCards = [
    { title: "Today's Sales", value: formatPrice(todaySales), icon: '💰', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-600' },
    { title: "Today's Orders", value: todayOrders, icon: '📦', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600' },
    { title: 'Pending Orders', value: pendingOrders, icon: '⏳', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-600' },
    { title: 'Delivered Today', value: deliveredOrders, icon: '✅', color: 'from-teal-500 to-emerald-600', textColor: 'text-teal-600' },
    { title: 'Total Revenue', value: formatPrice(totalRevenue), icon: '📈', color: 'from-purple-500 to-indigo-600', textColor: 'text-purple-600' },
    { title: 'Total Products', value: totalProducts, icon: '🛍️', color: 'from-orange-500 to-amber-600', textColor: 'text-orange-600' },
    { title: 'Total Customers', value: totalCustomers, icon: '👥', color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-600' },
    { title: 'Low Stock Items', value: lowStockItems.length, icon: '⚠️', color: 'from-rose-500 to-red-600', textColor: 'text-rose-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet>
        <title>Dashboard - {STORE_NAME} Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-heading text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Live real-time store metrics, sales &amp; inventory report.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Dynamic Stats Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Dynamic Charts ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue BarChart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-heading text-gray-900">Revenue (Last 7 Days)</h3>
            <span className="text-xs text-gray-400 font-medium">Daily total sales</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status PieChart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold font-heading text-gray-900 mb-6">Order Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {orderStatusPieData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs font-semibold text-gray-600 truncate">
                <span className="w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dynamic Low Stock Alert Table ────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold font-heading text-gray-900">Low Stock Alert</h3>
            <p className="text-xs text-gray-400">Products requiring restock (&lt; 10 items in inventory)</p>
          </div>
          <Link to="/admin/products" className="text-xs text-indigo-600 font-bold hover:underline">
            View All Products →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    🎉 All products have sufficient stock!
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => {
                  const catName = item.categories?.name || 'General';
                  const isOutOfStock = item.stock <= 0;
                  const isCritical = item.stock <= 3;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-500">{catName}</td>
                      <td className="px-6 py-4 font-black text-gray-900 text-sm">{item.stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : isCritical
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : isCritical ? 'Critical' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
