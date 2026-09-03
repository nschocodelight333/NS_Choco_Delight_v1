'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${loggedUser.name ? loggedUser.name.split(' ')[0] : 'User'}! 🍫`);
      router.push(loggedUser.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-cream flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-choco-gradient mx-auto flex items-center justify-center shadow-choco mb-4">
            <span className="text-3xl">🍫</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-choco-900">Welcome back</h1>
          <p className="text-choco-500 mt-1">Sign in to your NS Choco Delight account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-choco-lg border border-choco-100 p-8">
          <form onSubmit={handleSubmit} id="login-form">
            <div className="space-y-5">
              <div>
                <label className="label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Your password"
                    className="input-field pr-12"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-choco-400 hover:text-choco-700 transition-colors"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="btn-primary w-full mt-6 py-4 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-choco-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" id="login-register-link" className="text-choco-800 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
