'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getPublishedCampaigns } from '@/api/campaigns';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasOccasions, setHasOccasions] = useState(false);

  useEffect(() => {
    getPublishedCampaigns()
      .then((res) => setHasOccasions((res.data?.campaigns?.length || 0) > 0))
      .catch(() => setHasOccasions(false));
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    ...(hasOccasions ? [{ to: '/special-occasions', label: '🎉 Special Occasions' }] : []),
    { to: '/customize', label: '✨ Customize' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-choco-200/50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-choco-gradient flex items-center justify-center shadow-choco">
              <span className="text-cream text-lg">🍫</span>
            </div>
            <div>
              <p className="font-display font-bold text-choco-900 text-base leading-none">NS Choco Delight</p>
              <p className="text-choco-500 text-[10px] leading-none">Made with Heart</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-choco-100 text-choco-800 font-semibold'
                      : 'text-choco-700 hover:bg-choco-50 hover:text-choco-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
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

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  id="user-menu-btn"
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-choco-100/70 hover:bg-choco-100 text-choco-800 transition-all duration-200 text-sm font-medium border border-choco-200/60"
                >
                  <span className="w-7 h-7 rounded-full bg-choco-800 text-cream flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-choco-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-choco-lg border border-choco-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-choco-100">
                        <p className="font-bold text-choco-900 text-sm truncate">{user.name}</p>
                        <p className="text-choco-500 text-xs truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-extrabold bg-gold-100 text-gold-800 px-2 py-0.5 rounded-md">
                            👑 Admin
                          </span>
                        )}
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-choco-800 hover:bg-choco-50 font-semibold"
                        >
                          ⚙️ Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-choco-700 hover:bg-choco-50"
                      >
                        📦 My Orders
                      </Link>

                      <Link
                        href="/my-custom-orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-choco-700 hover:bg-choco-50"
                      >
                        ✨ Custom Requests
                      </Link>

                      <button
                        onClick={handleLogout}
                        id="logout-btn"
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        🚪 Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  id="nav-login-btn"
                  className="px-4 py-2 text-sm font-semibold text-choco-800 hover:bg-choco-50 rounded-xl transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  id="nav-register-btn"
                  className="btn-primary py-2 px-4 text-sm font-semibold shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-choco-800 hover:bg-choco-50 rounded-xl"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

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
                {navLinks.map((link) => {
                  const isActive = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to}
                      href={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-choco-100 text-choco-900 font-semibold' : 'text-choco-700 hover:bg-choco-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {userMenuOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
};

export default Navbar;
