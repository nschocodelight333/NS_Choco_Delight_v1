import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🍫`);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || (err.message?.includes('Network Error') ? 'Server connection error. Please ensure backend is running.' : 'Login failed. Check your credentials.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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
                <label className="label" htmlFor="login-email">Email</label>
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
                <label className="label" htmlFor="login-password">Password</label>
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-choco-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" id="login-register-link" className="text-choco-800 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
