import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user.service';
import { STORE_NAME } from '../../constants';
import Spinner from '../../components/ui/Spinner';
import { useLanguageStore } from '../../store/languageStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { logout } = useAuth();
  const { t, language } = useLanguageStore();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  // Fetch profile from our backend (Supabase user record)
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => userService.getProfile().then(r => r.data?.data || r.data),
  });

  const profile = profileData;

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Profile updated successfully!');
      setEditing(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    },
  });

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty.');
    updateMutation.mutate({ name: form.name.trim(), phone: form.phone.trim() });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
  );

  const displayName  = profile?.name  || 'Customer';
  const displayPhone = profile?.phone || '';
  const displayEmail = profile?.email || '';
  const initial      = displayName.charAt(0).toUpperCase();

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto px-4 py-12">
      <Helmet>
        <title>{t('profile')} - {STORE_NAME}</title>
      </Helmet>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32 relative" />

        <div className="px-6 pb-8 relative">
          {/* Avatar */}
          <div className="-mt-16 mb-4 flex justify-between items-end">
            <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-md">
              <div className="w-full h-full rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-3xl">
                {initial}
              </div>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {t('edit_profile')}
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {t('cancel')}
              </button>
            )}
          </div>

          {/* User Info / Edit Form */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-heading text-gray-900 mb-1">{displayName}</h1>
            {displayPhone && <p className="text-gray-500 text-sm mb-4">+91 {displayPhone}</p>}

            <div className="space-y-4 max-w-lg mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('full_name_label')}</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-primary-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-200 text-gray-900 transition-colors"
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium">
                    {displayName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('phone_number_label')}</label>
                {editing ? (
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm">+91</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="flex-1 p-3 bg-gray-50 border border-primary-300 rounded-r-xl outline-none focus:ring-2 focus:ring-primary-200 text-gray-900 transition-colors"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                ) : (
                  <p className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                    {displayPhone ? `+91 ${displayPhone}` : '—'}
                  </p>
                )}
              </div>

              {displayEmail && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('email_label')}</label>
                  <p className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm">
                    {displayEmail}
                  </p>
                </div>
              )}

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? t('saving') : t('save_changes')}
                </button>
              )}
            </div>
          </div>

          {/* Member since */}
          {profile?.created_at && (
            <p className="text-xs text-gray-400 mb-6 text-center">
              {t('member_since')} {new Date(profile.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' })}
            </p>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl transition-colors border border-red-200"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
