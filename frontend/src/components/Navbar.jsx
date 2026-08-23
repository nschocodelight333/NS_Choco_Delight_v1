import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/special-occasions', label: '🎉 Special Occasion' },
    { to: '/customize', label: '✨ Customize' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-choco-200/50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-choco-gradient flex items-center justify-center shadow-choco">
              <span className="text-cream text-lg">🍫</span>
            </div>
            <div>
              <p className="font-display font-bold text-choco-900 text-base leading-none">NS Choco Delight</p>
              <p className="text-choco-500 text-[10px] leading-none">Made with Heart</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-choco-100 text-choco-800 font-semibold'
                      : 'text-choco-700 hover:bg-choco-50 hover:text-choco-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              id="nav-cart-btn"
              className="relative p-2.5 rounded-xl bg-choco-50 hover:bg-choco-100 text-choco-800 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-gold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-choco-800 text-cream text-sm font-medium hover:bg-choco-900 transition-all duration-200"
                >
                  <span className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-choco-900 text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:block max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-choco-lg border border-choco-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-choco-100">
                        <p className="text-sm font-semibold text-choco-900">{user.name}</p>
                        <p className="text-xs text-choco-500 truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-choco-700 hover:bg-choco-50 transition-colors"
                        >
                          <span>🛠️</span> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-choco-700 hover:bg-choco-50 transition-colors"
                      >
                        <span>📦</span> My Orders
                      </Link>
                      <Link
                        to="/my-custom-orders"
                        onClick={() => setUserMenuOpen(false)}
                        id="nav-custom-orders-link"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-choco-700 hover:bg-choco-50 transition-colors"
                      >
                        <span>✏️</span> Custom Requests
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-choco-700 hover:bg-choco-50 transition-colors"
                      >
                        <span>👤</span> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-choco-100"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" id="nav-login-btn" className="btn-secondary py-2 px-4 text-xs">
                  Login
                </Link>
                <Link to="/register" id="nav-register-btn" className="btn-primary py-2 px-4 text-xs">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-choco-700 hover:bg-choco-100"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-choco-100"
            >
              <div className="py-3 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-choco-100 text-choco-900 font-semibold' : 'text-choco-700 hover:bg-choco-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
};

export default Navbar;
