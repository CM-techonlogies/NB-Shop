import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supaCustomers } from '../../services/supabaseAdmin';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

export default function CustomersAdminPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // ── Fetch directly from Supabase (bypasses Render auth) ──────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => supaCustomers.getAll(),
    staleTime: 2 * 60 * 1000,
  });

  const customers = Array.isArray(data) ? data : [];

  // Client-side search filter (no API roundtrip)
  const filtered = search.trim()
    ? customers.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search)
      )
    : customers;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet><title>Customers - {STORE_NAME} Admin</title></Helmet>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${filtered.length} of ${customers.length} customers`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full max-w-md p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <p className="text-center text-red-500 py-10">Failed to load customers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-400">No customers found.</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{c.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{c.phone ? `+91 ${c.phone}` : '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{fmtDate(c.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
