import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { STORE_NAME } from '../../constants';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/category.service';
import toast from 'react-hot-toast';

import { getCategoryName } from '../../constants/translations';

const EMPTY_FORM = { name: '', name_hi: '', description: '', image_url: '', sort_order: 0, visible: true };

export default function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null); // null = add mode
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: () => categoryService.getAllAdmin().then(r => r.data?.data || r.data || []),
  });
  const categories = data || [];

  const createMutation = useMutation({
    mutationFn: (d) => categoryService.createCategory(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created!');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated!');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
      toast.success('Category deleted!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Cannot delete: products may exist'),
  });

  const openAdd = () => { setEditCategory(null); setForm(EMPTY_FORM); setIsModalOpen(true); };
  const openEdit = (cat) => {
    setEditCategory(cat);
    const hiMatch = (cat.description || '').match(/hi:\s*([^|;\n\]]+)/i);
    const name_hi = hiMatch ? hiMatch[1].trim() : '';
    const cleanDesc = (cat.description || '').replace(/hi:\s*[^|;\n\]]+/gi, '').trim();
    setForm({
      name: cat.name,
      name_hi,
      description: cleanDesc,
      image_url: cat.image_url || '',
      sort_order: cat.sort_order || 0,
      visible: cat.visible
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditCategory(null); setForm(EMPTY_FORM); };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    let finalDescription = form.description ? form.description.trim() : '';
    if (form.name_hi && form.name_hi.trim()) {
      finalDescription = `${finalDescription} hi:${form.name_hi.trim()}`.trim();
    }
    const payload = {
      name: form.name.trim(),
      description: finalDescription,
      image_url: form.image_url,
      sort_order: form.sort_order,
      visible: form.visible
    };
    if (editCategory) {
      updateMutation.mutate({ id: editCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (cat) => {
    if (window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(cat.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <Helmet><title>Manage Categories - {STORE_NAME} Admin</title></Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <button onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <PlusIcon className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Sort Order</th>
              <th className="px-6 py-4">Visibility</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">No categories yet. Add one!</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl overflow-hidden">
                    {cat.image_url
                      ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      : '🛍️'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    {getCategoryName(cat, 'hi') !== cat.name && (
                      <span className="text-xs bg-orange-50 text-primary-600 font-semibold px-2 py-0.5 rounded-full border border-orange-100">
                        {getCategoryName(cat, 'hi')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{cat.sort_order || 0}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${cat.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.visible ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-5">{editCategory ? 'Edit Category' : 'Add Category'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (English) *</label>
                <input className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Dairy & Eggs"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hindi Name (हिन्दी नाम) <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <input className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-orange-50/40 border-orange-200"
                  placeholder="e.g. दूध और अंडे"
                  value={form.name_hi} onChange={e => setForm({ ...form, name_hi: e.target.value })} />
                <p className="text-[11px] text-gray-400 mt-1">If left empty, common categories are auto-translated.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Short description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                  value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                {form.image_url && (
                  <img src={form.image_url} alt="preview"
                    className="mt-2 w-16 h-16 object-cover rounded-lg border"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0"
                    value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.visible}
                      onChange={e => setForm({ ...form, visible: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Visible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editCategory ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
