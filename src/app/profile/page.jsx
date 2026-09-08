'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading, updateUserProfile } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
      });
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });
      toast.success('Profile details updated successfully! 🍫');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 shadow-choco-sm border border-choco-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-choco-gradient flex items-center justify-center text-cream text-2xl font-bold shadow-choco">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-choco-900">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="text-[11px] font-extrabold bg-gold-100 text-gold-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    👑 Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-choco-500">{user.email}</p>
              {user.phone && <p className="text-xs text-choco-600 font-mono mt-0.5">📱 {user.phone}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'admin' ? (
              <Link href="/admin/dashboard" className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-choco">
                👑 Admin Dashboard
              </Link>
            ) : (
              <Link href="/orders" className="btn-secondary text-xs sm:text-sm py-2 px-4">
                📦 My Orders
              </Link>
            )}
          </div>
        </div>

        {/* Profile Edit Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-choco-sm border border-choco-100"
        >
          <div className="border-b border-choco-100 pb-4 mb-6">
            <h2 className="font-display text-xl font-bold text-choco-900">Personal & Contact Details</h2>
            <p className="text-xs text-choco-500 mt-1">
              Ensure your mobile phone number is accurate for WhatsApp delivery alerts and order updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field text-sm"
                  placeholder="e.g. Komesh Bathula"
                />
              </div>

              <div>
                <label className="label">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field font-mono text-sm"
                  placeholder="e.g. 9876543210"
                />
                <p className="text-[11px] text-choco-400 mt-1">Used for order communication & SMS/WhatsApp alerts.</p>
              </div>
            </div>

            <div>
              <label className="label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="input-field bg-choco-50/70 text-choco-500 cursor-not-allowed text-sm"
              />
            </div>

            {/* Saved Address Section */}
            <div className="pt-4 border-t border-choco-100">
              <h3 className="font-display text-base font-bold text-choco-900 mb-1">Default Delivery Address</h3>
              <p className="text-xs text-choco-500 mb-4">
                Saved address automatically pre-fills during checkout.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="label">Street Address</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="House/Flat number, Street name, Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="e.g. Hyderabad"
                    />
                  </div>

                  <div>
                    <label className="label">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="e.g. Telangana"
                    />
                  </div>

                  <div>
                    <label className="label">PIN Code</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={form.pincode}
                      onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                      className="input-field font-mono text-sm"
                      placeholder="e.g. 500001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Submit */}
            <div className="pt-4 border-t border-choco-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-gold py-3 px-8 text-sm font-bold shadow-gold rounded-xl flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span> Saving Changes...
                  </>
                ) : (
                  <>💾 Save Profile Details</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
