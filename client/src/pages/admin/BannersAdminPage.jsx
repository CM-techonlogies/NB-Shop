import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { STORE_NAME } from '../../constants';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '',
  image_url: '',
  link: '',
  type: 'slider',
  sort_order: 0,
  active: true,
};

export default function BannersAdminPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState(null); // null = Add Mode
  const [form, setForm] = useState(EMPTY_FORM);

  // Fetch all banners (including inactive)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => adminService.getBanners().then(r => r.data?.data || r.data || []),
  });
  const banners = Array.isArray(data) ? data : [];

  // Create Banner Mutation
  const createMutation = useMutation({
    mutationFn: (d) => adminService.createBanner(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner created successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create banner');
    },
  });

  // Update Banner Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner updated successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update banner');
    },
  });

  // Delete Banner Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner deleted!');
    },
    onError: () => toast.error('Failed to delete banner'),
  });

  const openAddModal = () => {
    setEditBanner(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditBanner(banner);
    setForm({
      title: banner.title || '',
      image_url: banner.image_url || '',
      link: banner.link || '',
      type: banner.type || 'slider',
      sort_order: banner.sort_order || 0,
      active: banner.active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditBanner(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.image_url.trim()) return toast.error('Image URL is required');

    const payload = {
      ...form,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editBanner) {
      updateMutation.mutate({ id: editBanner.id || editBanner._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (banner) => {
    const bannerId = banner.id || banner._id;
    if (window.confirm(`Delete banner "${banner.title || 'Untitled'}"?`)) {
      deleteMutation.mutate(bannerId);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet>
        <title>Manage Banners - {STORE_NAME} Admin</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500">Manage promotional hero banners</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Add Banner
        </button>
      </div>

      {/* Banner Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <p className="text-center text-red-500 py-10">Failed to load banners.</p>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <span className="text-5xl mb-3 block">🖼️</span>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Banners Found</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first homepage promo banner.</p>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Add Banner Now
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const bId = banner.id || banner._id;
            return (
              <div
                key={bId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Banner Image Preview */}
                <div className="h-44 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Banner'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-4xl text-gray-300">🖼️</span>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs ${
                      banner.active ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Banner Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {banner.title || 'Untitled Banner'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mb-4">
                    Link: <span className="text-indigo-600 font-medium">{banner.link || 'None'}</span>
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      Order: <strong className="text-gray-700">{banner.sort_order || 0}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Edit Banner"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Banner"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Mega Sale"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/banner.jpg"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {form.image_url && (
                  <div className="mt-2 h-28 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                    <img
                      src={form.image_url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Destination Link */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Link (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /products?category=beverages"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Type & Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Banner Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="slider">Slider Banner</option>
                    <option value="festival">Festival Promo</option>
                    <option value="offer">Offer Strip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-400"
                  />
                  <span className="text-xs font-bold text-gray-800">Active (Visible on Storefront)</span>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-2 active:scale-95"
                >
                  {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
