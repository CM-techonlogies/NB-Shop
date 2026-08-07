import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: () =>
      userService.getAllUsers({ search: search || undefined })
        .then(r => r.data?.data?.data || r.data?.data || r.data || []),
    staleTime: 2 * 60 * 1000,
  });

  const toggleActive = useMutation({
    mutationFn: (id) => userService.toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Customer status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const customers = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet><title>Customers - {STORE_NAME} Admin</title></Helmet>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${customers.length} registered customers`}
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {customers.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-400">No customers found.</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id || c._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{c.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{c.phone ? `+91 ${c.phone}` : '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{fmtDate(c.created_at || c.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleActive.mutate(c.id || c._id)}
                        disabled={toggleActive.isPending}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          c.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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
