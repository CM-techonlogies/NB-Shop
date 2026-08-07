import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function SettingsAdminPage() {
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminService.getSettings().then(r => r.data?.data || r.data),
  });

  const settings = settingsData;

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      store_name: '',
      store_phone: '',
      store_address: '',
      store_email: '',
      upi_id: '',
      upi_qr_url: '',
      delivery_charge: 40,
      free_delivery_above: 499,
      business_hours: '',
    },
  });

  // Populate form once settings load
  useEffect(() => {
    if (settings) {
      reset({
        store_name:         settings.store_name         || '',
        store_phone:        settings.store_phone        || '',
        store_address:      settings.store_address      || '',
        store_email:        settings.store_email        || '',
        upi_id:             settings.upi_id             || '',
        upi_qr_url:         settings.upi_qr_url         || '',
        delivery_charge:    settings.delivery_charge    ?? 40,
        free_delivery_above: settings.free_delivery_above ?? 499,
        business_hours:     settings.business_hours     || '',
      });
    }
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => adminService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings saved successfully!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save settings.');
    },
  });

  const onSubmit = (data) => {
    // Convert numeric fields
    const payload = {
      ...data,
      delivery_charge:    Number(data.delivery_charge),
      free_delivery_above: Number(data.free_delivery_above),
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
      <Helmet><title>Settings - {STORE_NAME} Admin</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500">Manage your store information and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* General Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-5">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                {...register('store_name', { required: 'Store name is required' })}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="My Kirana Store"
              />
              {errors.store_name && <p className="text-red-500 text-xs mt-1">{errors.store_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                {...register('store_phone')}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register('store_email')}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="store@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
              <input
                {...register('business_hours')}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="Mon-Sat: 8am - 9pm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
              <textarea
                {...register('store_address')}
                rows="2"
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
                placeholder="123 Main Street, Your City"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Payments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-5">Delivery &amp; Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                {...register('delivery_charge', { min: 0 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                {...register('free_delivery_above', { min: 0 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                {...register('upi_id')}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="yourname@upi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI QR Code Image URL
                <span className="text-xs text-gray-400 font-normal ml-1">(paste image URL)</span>
              </label>
              <input
                {...register('upi_qr_url')}
                className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow transition-colors flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : 'Save Settings'}
          </button>
          {updateMutation.isSuccess && (
            <p className="text-green-600 text-sm font-medium">✅ Saved successfully!</p>
          )}
        </div>
      </form>
    </div>
  );
}
