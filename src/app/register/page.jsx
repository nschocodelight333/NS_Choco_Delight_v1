'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const userData = await register(form);
      toast.success(`Account created! Welcome, ${userData.name.split(' ')[0]}! 🍫`);
      router.push('/');
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="font-display text-3xl font-bold text-choco-900">Create Account</h1>
          <p className="text-choco-500 mt-1">Join NS Choco Delight today</p>
        </div>

        <div className="bg-white rounded-3xl shadow-choco-lg border border-choco-100 p-8">
          <form onSubmit={handleSubmit} id="register-form">
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="register-name">Full Name *</label>
                <input
                  id="register-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="register-email">Email *</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="register-phone">Phone</label>
                <input
                  id="register-phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label" htmlFor="register-password">Password *</label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="input-field pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-choco-400 hover:text-choco-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="register-submit-btn"
              className="btn-primary w-full mt-6 py-4 text-base"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-choco-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" id="register-login-link" className="text-choco-800 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
