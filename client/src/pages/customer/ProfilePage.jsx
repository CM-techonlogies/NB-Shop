import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { userService } from '../../services/user.service';
import { STORE_NAME, OWNER_WHATSAPP } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import { useLanguageStore } from '../../store/languageStore';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EMPTY_ADDRESS = {
  label: 'Home',
  name: '',
  phone: '',
  address: '',
  landmark: '',
  city: 'Abu Road',
  pincode: '307026',
  isDefault: false,
};

export default function ProfilePage() {
  const { user, userId, logout } = useAuth();
  const { itemCount } = useCart();
  const { t, language, toggleLanguage } = useLanguageStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Fetch profile (uses direct Supabase fallback if API 401s)
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile', userId],
    queryFn: () => userService.getProfile(userId),
    enabled: !!userId,
  });

  const profile = profileData;
  const addresses = Array.isArray(profile?.addresses) ? profile.addresses : [];

  // Populate form when profile or clerk user loads
  useEffect(() => {
    const initialName = profile?.name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '';
    const initialPhone = profile?.phone || user?.primaryPhoneNumber?.phoneNumber?.replace('+91', '') || '';
    setForm({ name: initialName, phone: initialPhone });
  }, [profile, user]);

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data, userId),
    onSuccess: async () => {
      // Also update Clerk user profile name if possible
      if (user && form.name.trim()) {
        try {
          const parts = form.name.trim().split(' ');
          const firstName = parts[0] || 'Customer';
          const lastName = parts.slice(1).join(' ') || '';
          await user.update({ firstName, lastName });
        } catch (_) {}
      }
      queryClient.invalidateQueries({ queryKey: ['my-profile', userId] });
      toast.success(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!');
      setEditing(false);
    },
    onError: (err) => {
      toast.error(err?.message || (language === 'hi' ? 'प्रोफ़ाइल अपडेट करने में विफल।' : 'Failed to update profile.'));
    },
  });

  // Save Address Mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (data) => {
      if (editingAddressId) {
        return userService.updateAddress(editingAddressId, data, userId);
      } else {
        return userService.addAddress(data, userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile', userId] });
      toast.success(editingAddressId ? 'Address updated!' : 'Address added!');
      setIsAddressModalOpen(false);
      setAddressForm(EMPTY_ADDRESS);
      setEditingAddressId(null);
    },
    onError: () => toast.error('Failed to save address.'),
  });

  // Delete Address Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (id) => userService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile', userId] });
      toast.success('Address removed.');
    },
    onError: () => toast.error('Failed to delete address.'),
  });

  // Set Default Address Mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: (id) => userService.setDefaultAddress(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile', userId] });
      toast.success('Default address updated.');
    },
  });

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return toast.error(language === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Name cannot be empty.');
    updateMutation.mutate({ name: form.name.trim(), phone: form.phone.trim() });
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS,
      name: form.name || '',
      phone: form.phone || '',
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || 'Home',
      name: addr.name || '',
      phone: addr.phone || '',
      address: addr.address || '',
      landmark: addr.landmark || '',
      city: addr.city || 'Abu Road',
      pincode: addr.pincode || '307026',
      isDefault: Boolean(addr.is_default),
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.address.trim()) return toast.error('Address is required');
    if (!addressForm.phone.trim()) return toast.error('Phone number is required');
    saveAddressMutation.mutate(addressForm);
  };

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayName = form.name || profile?.name || user?.fullName || 'Customer';
  const displayPhone = form.phone || profile?.phone || user?.primaryPhoneNumber?.phoneNumber?.replace('+91', '') || '';
  const displayEmail = profile?.email || user?.primaryEmailAddress?.emailAddress || '';
  const initial = displayName.charAt(0).toUpperCase() || 'C';

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto px-4 py-8 md:py-12 pb-24">
      <Helmet>
        <title>{t('profile')} - {STORE_NAME}</title>
      </Helmet>

      {/* ── Main Profile Header Card ─────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500 h-28 md:h-36 relative">
          <div className="absolute right-4 top-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30 flex items-center gap-1.5">
            <ShieldCheckIcon className="w-4 h-4 text-white" />
            <span>{profile?.role === 'admin' ? 'Store Admin' : 'Verified Member'}</span>
          </div>
        </div>

        <div className="px-6 pb-8 relative">
          {/* Avatar + Action Row */}
          <div className="-mt-14 mb-4 flex justify-between items-end">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1.5 shadow-md flex-shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary-500 to-amber-400 text-white flex items-center justify-center font-black text-3xl md:text-4xl shadow-inner">
                  {initial}
                </div>
              )}
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-5 py-2.5 rounded-2xl text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                {t('edit_profile')}
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl text-sm transition-all"
              >
                {t('cancel')}
              </button>
            )}
          </div>

          {/* User Basic Info Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black font-heading text-gray-900 mb-1">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {displayPhone && (
                <span className="flex items-center gap-1">
                  <PhoneIcon className="w-4 h-4 text-primary-500" />
                  +91 {displayPhone}
                </span>
              )}
              {displayEmail && (
                <span className="flex items-center gap-1 text-gray-500">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  {displayEmail}
                </span>
              )}
            </div>
          </div>

          {/* ── Edit Form (When Active) ─────────────────────────────── */}
          {editing && (
            <form onSubmit={handleSaveProfile} className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 mb-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <PencilSquareIcon className="w-4 h-4 text-primary-500" />
                {language === 'hi' ? 'विवरण संपादित करें' : 'Edit Personal Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('full_name_label')} *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('phone_number_label')} *</label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-semibold">+91</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="flex-1 p-3 bg-white border border-gray-200 rounded-r-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 text-gray-600 bg-white hover:bg-gray-100 rounded-xl text-xs font-bold border"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-2"
                >
                  {updateMutation.isPending ? t('saving') : t('save_changes')}
                </button>
              </div>
            </form>
          )}

          {/* ── Quick Action Hub (4 Cards) ─────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Orders */}
            <Link
              to="/orders"
              className="bg-gray-50 hover:bg-primary-50/50 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ShoppingBagIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">{t('orders')}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{language === 'hi' ? 'ऑर्डर ट्रैक करें' : 'Track orders'}</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="bg-gray-50 hover:bg-primary-50/50 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 transition-all flex flex-col items-center text-center group relative"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ShoppingCartIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">{t('cart')}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{itemCount} {t('in_cart')}</span>
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="bg-gray-50 hover:bg-primary-50/50 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <LanguageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">{language === 'en' ? 'हिंदी' : 'English'}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{t('language')}</span>
            </button>

            {/* WhatsApp Help */}
            <a
              href={`https://wa.me/${OWNER_WHATSAPP}?text=Hello%20NB%20Shop,%20I%20need%20help%20with%20my%20account`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 hover:bg-green-50/50 p-4 rounded-2xl border border-gray-100 hover:border-green-200 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">{language === 'hi' ? 'सहायता' : 'Support'}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">WhatsApp 💬</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Saved Delivery Addresses Section ─────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-gray-900 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-primary-500" />
              {language === 'hi' ? 'डिलीवरी के पते (Saved Addresses)' : 'Delivery Addresses'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'hi' ? 'ऑर्डर की तेज़ डिलीवरी के लिए अपने पते प्रबंधित करें।' : 'Manage your saved delivery locations for fast checkout.'}
            </p>
          </div>
          <button
            onClick={handleOpenAddAddress}
            className="bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            {language === 'hi' ? 'नया पता जोड़ें' : 'Add Address'}
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-2xl mb-1">🏠</p>
            <p className="text-sm font-bold text-gray-700">{language === 'hi' ? 'कोई सुरक्षित पता नहीं है' : 'No saved addresses yet'}</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">Add your home or office address for 1-tap checkout</p>
            <button
              onClick={handleOpenAddAddress}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all"
            >
              + {language === 'hi' ? 'पता जोड़ें' : 'Add Address'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  addr.is_default ? 'bg-orange-50/40 border-primary-300 ring-1 ring-primary-300' : 'bg-gray-50/60 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border text-gray-700">
                    {addr.label === 'Home' ? '🏠 Home' : addr.label === 'Work' ? '🏢 Work' : '📍 ' + (addr.label || 'Address')}
                  </span>
                  {addr.is_default && (
                    <span className="text-[10px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>

                <p className="font-bold text-sm text-gray-900">{addr.name}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{addr.address}</p>
                {addr.landmark && <p className="text-xs text-gray-400 mt-0.5">Near: {addr.landmark}</p>}
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {addr.city}, {addr.pincode} • 📞 +91 {addr.phone}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60">
                  {!addr.is_default ? (
                    <button
                      onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-bold hover:underline"
                    >
                      {language === 'hi' ? 'डिफ़ॉल्ट बनाएं' : 'Set as Default'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-green-600 font-bold">✓ Active Default</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this address?')) {
                          deleteAddressMutation.mutate(addr.id);
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Store Info & Timings Card ────────────────────────────── */}
      <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <p className="text-sm font-bold text-gray-800">🏪 {STORE_NAME} (M/s NAVARAM BHUBAJI)</p>
          <p className="text-xs text-gray-500 mt-0.5">Abu Road, Rajasthan • Daily 8:00 AM – 10:00 PM</p>
        </div>
        <a
          href={`https://wa.me/${OWNER_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs border shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>WhatsApp Hotline: +91 {OWNER_WHATSAPP}</span>
        </a>
      </div>

      {/* ── Logout Button ────────────────────────────────────────── */}
      <button
        onClick={logout}
        className="w-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold py-4 rounded-2xl transition-all border border-red-200 shadow-xs flex items-center justify-center gap-2 text-sm"
      >
        <span>🚪</span>
        {t('logout')}
      </button>

      {/* ── Add / Edit Address Modal ─────────────────────────────── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-bold font-heading text-gray-900 mb-4">
              {editingAddressId ? (language === 'hi' ? 'पता एडिट करें' : 'Edit Address') : (language === 'hi' ? 'नया पता जोड़ें' : 'Add New Address')}
            </h3>

            <form onSubmit={handleSaveAddressSubmit} className="space-y-3.5">
              {/* Address Label */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Label (Tag)</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setAddressForm((f) => ({ ...f, label: l }))}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        addressForm.label === l ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {l === 'Home' ? '🏠 Home' : l === 'Work' ? '🏢 Work' : '📍 Other'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Recipient Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Complete Address *</label>
                <textarea
                  rows={2}
                  value={addressForm.address}
                  onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="House / Flat / Street / Area"
                  required
                />
              </div>

              {/* Landmark, City, Pincode */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm((f) => ({ ...f, landmark: e.target.value }))}
                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Near temple..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value }))}
                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Set as default checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-xs font-bold text-gray-700">Set as default delivery address</span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saveAddressMutation.isPending}
                  className="px-5 py-2 text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-xl text-xs font-bold shadow"
                >
                  {saveAddressMutation.isPending ? t('saving') : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

