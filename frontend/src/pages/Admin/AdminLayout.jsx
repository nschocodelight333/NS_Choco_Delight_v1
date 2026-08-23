import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';

const adminNavLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '🍫' },
  { to: '/admin/campaigns', label: 'Campaigns', icon: '🎉' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/custom-requests', label: 'Custom Requests', icon: '✏️' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-choco-50">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className="w-64 bg-choco-900 flex-shrink-0 hidden md:flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-choco-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-lg shadow-gold">🍫</div>
            <div>
              <p className="font-display font-bold text-cream text-sm">NS Choco Delight</p>
              <p className="text-gold-400 text-[10px] uppercase tracking-wider font-semibold">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin User */}
        <div className="p-4 border-b border-choco-700">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-choco-900 font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-cream text-sm font-medium truncate">{user?.name}</p>
              <p className="text-choco-400 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-gradient text-choco-900 shadow-gold'
                    : 'text-choco-300 hover:bg-choco-700 hover:text-cream'
                }`
              }
              id={`admin-nav-${link.label.toLowerCase()}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-choco-700 space-y-2">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-choco-300 hover:bg-choco-700 hover:text-cream transition-all"
          >
            <span>🏠</span> View Store
          </NavLink>
          <button
            onClick={handleLogout}
            id="admin-logout-btn"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Mobile topbar */}
        <div className="md:hidden bg-choco-900 px-4 py-3 flex items-center justify-between">
          <p className="font-display font-bold text-cream text-sm">🍫 Admin</p>
          <div className="flex gap-2">
            {adminNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `p-2 rounded-lg text-lg ${isActive ? 'bg-gold-500' : 'text-choco-300'}`
                }
                title={link.label}
              >
                {link.icon}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <BackButton />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
