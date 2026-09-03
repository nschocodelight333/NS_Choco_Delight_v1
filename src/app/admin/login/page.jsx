'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      toast.success(`Welcome back, Admin ${user.name.split(' ')[0]}! 🛠️`);
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-choco-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold-gradient mx-auto flex items-center justify-center shadow-gold mb-4">
            <span className="text-3xl">🛠️</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Admin Portal</h1>
          <p className="text-choco-300 mt-1 text-sm">Protected System Access</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="admin-email">Admin Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 py-4 text-base"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
