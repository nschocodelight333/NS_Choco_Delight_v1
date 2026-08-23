import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getDashboardAnalytics } from '../../api/admin';

const StatCard = ({ icon, label, value, color, delay, subtext, to }) => {
  const content = (
    <div className={`flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-choco-500 text-xs font-medium">{label}</p>
        <p className="font-display text-2xl font-bold text-choco-900 mt-0.5">{value}</p>
        {subtext && <p className="text-[11px] text-choco-400 mt-0.5 font-medium leading-tight">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-choco-100 p-5 hover:border-choco-300 transition-all cursor-pointer"
    >
      {to ? <Link to={to} className="block">{content}</Link> : content}
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-choco-900 text-amber-50 p-3 rounded-xl shadow-xl border border-choco-700 text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-amber-200 border-b border-choco-700 pb-1">{label}</p>
        <p className="font-display text-base font-bold text-white">
          ₹{(data.totalRevenue || 0).toLocaleString('en-IN')}
        </p>
        <div className="space-y-0.5 pt-0.5 text-[11px] text-amber-100/90">
          <div className="flex justify-between gap-4">
            <span className="text-blue-300">💳 UPI:</span>
            <span className="font-semibold">₹{(data.upiRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-emerald-300">💵 COD:</span>
            <span className="font-semibold">₹{(data.codRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-choco-800 text-[10px] text-choco-300">
            <span>Orders:</span>
            <span className="font-bold text-white">{data.orders || 0}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'thisYear', label: 'This Year' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState('today');

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
    getDashboardAnalytics()
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const STATUS_COLORS = {
    Pending: 'text-yellow-700 bg-yellow-50',
    'Pending Review': 'text-yellow-700 bg-yellow-50',
    Confirmed: 'text-blue-700 bg-blue-50',
    Preparing: 'text-purple-700 bg-purple-50',
    Prepared: 'text-teal-700 bg-teal-50',
    'Out for Delivery': 'text-orange-700 bg-orange-50',
    Delivered: 'text-green-700 bg-green-50',
    Quoted: 'text-indigo-700 bg-indigo-50',
    Accepted: 'text-emerald-700 bg-emerald-50',
    Rejected: 'text-red-700 bg-red-50',
    Cancelled: 'text-red-700 bg-red-50',
  };

  const currentAnalytics = analytics?.[activePeriod] || {
    totalRevenue: 0,
    upiRevenue: 0,
    codRevenue: 0,
    orders: 0,
    percentChange: 0,
    chartData: [],
  };

  const isUp = currentAnalytics.percentChange > 0;
  const isDown = currentAnalytics.percentChange < 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-choco-900">Dashboard</h1>
        <p className="text-choco-500 mt-1">Overview of your chocolate business</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-choco-100 p-5 h-24 skeleton" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* 5 Stats Cards including Custom Orders Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon="📦"
              label="Total Orders"
              value={stats.totalOrders}
              color="bg-blue-50"
              delay={0}
              subtext={`${stats.websiteOrdersThisMonth || 0} web / ${stats.whatsappOrdersThisMonth || 0} WA`}
              to="/admin/orders"
            />
            <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} color="bg-green-50" delay={0.05} />
            <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="bg-yellow-50" delay={0.1} to="/admin/orders" />
            <StatCard
              icon="🎨"
              label="Custom Orders"
              value={stats.totalCustomRequests || 0}
              color="bg-pink-50 text-pink-600"
              delay={0.15}
              subtext={`${stats.pendingCustomRequests || 0} pending review`}
              to="/admin/custom-requests"
            />
            <StatCard icon="👥" label="Customers" value={stats.totalCustomers} color="bg-purple-50" delay={0.2} to="/admin/customers" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-display font-bold text-choco-900 text-lg">Recent Orders</h2>
                  <p className="text-choco-400 text-xs">Website, WhatsApp &amp; Custom Orders</p>
                </div>

                <Link to="/admin/orders" className="text-choco-600 hover:text-choco-900 text-xs font-semibold hover:underline">
                  View all →
                </Link>
              </div>

              {!stats.recentOrders || stats.recentOrders.length === 0 ? (
                <p className="text-choco-400 text-sm text-center py-8">No recent orders found</p>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {stats.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-2.5 border-b border-choco-50 last:border-0 hover:bg-choco-50/50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {order.type === 'custom' ? '🎨' : order.type === 'whatsapp' ? '💬' : '🌐'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-choco-900 line-clamp-1">
                              {order.customerName}
                            </p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              order.type === 'custom' ? 'bg-pink-100 text-pink-800' :
                              order.type === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.type === 'custom' ? 'Custom' : order.type === 'whatsapp' ? 'WhatsApp' : 'Website'}
                            </span>
                          </div>
                          <p className="text-xs text-choco-400 font-mono">
                            #{order._id.slice(-6).toUpperCase()} {order.title ? `· ${order.title}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {order.orderStatus}
                        </span>
                        <span className="font-bold text-choco-900 text-sm">
                          {order.totalAmount > 0 ? `₹${order.totalAmount}` : 'Quote Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-choco-900 text-lg">
                  ⚠️ Low Stock Alert
                </h2>
                <Link to="/admin/products" className="text-choco-600 hover:text-choco-900 text-sm font-medium">Manage →</Link>
              </div>
              {stats.lowStockProducts?.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-2">✅</span>
                  <p className="text-green-600 font-medium text-sm">All products well stocked!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between py-2 border-b border-choco-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-choco-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-choco-400">{product.category}</p>
                      </div>
                      <span className={`badge text-xs px-2 py-0.5 rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-choco-900 text-lg">Orders by Status</h2>
                <p className="text-choco-400 text-xs mt-0.5">Click any status to view customer details and order lists</p>
              </div>
              <Link to="/admin/orders" className="text-choco-600 hover:text-choco-900 text-xs font-semibold hover:underline">
                View all orders →
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.ordersByStatus?.map((item) => (
                <Link
                  key={item._id}
                  to={`/admin/orders?status=${encodeURIComponent(item._id)}`}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${STATUS_COLORS[item._id] || 'bg-gray-50 text-gray-700'} hover:scale-105 hover:shadow-md transition-all border border-black/5 cursor-pointer font-medium`}
                  title={`View all ${item._id} orders`}
                >
                  <span className="font-bold text-lg font-display">{item.count}</span>
                  <span className="text-sm font-semibold">{item._id}</span>
                  <span className="text-xs opacity-60 ml-0.5">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Stock-Market Style Revenue Analytics ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 space-y-6">
            {/* Header + Period Selector Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-choco-100 pb-4">
              <div>
                <h2 className="font-display font-bold text-choco-900 text-xl flex items-center gap-2">
                  <span>📈</span> Revenue Analytics
                </h2>
                <p className="text-choco-400 text-xs mt-0.5">Real-time revenue timeline &amp; period performance</p>
              </div>

              {/* Period Selector Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-choco-50/80 rounded-xl border border-choco-100 overflow-x-auto">
                {PERIODS.map(({ key, label }) => {
                  const isActive = activePeriod === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePeriod(key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-choco-900 text-white shadow-sm'
                          : 'text-choco-700 hover:text-choco-900 hover:bg-choco-100/60'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {analyticsLoading ? (
              <div className="h-72 bg-choco-50 animate-pulse rounded-2xl flex items-center justify-center">
                <span className="text-choco-400 text-sm">Loading analytics chart...</span>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Stock Ticker Header Stats */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-choco-50/60 p-4 rounded-2xl border border-choco-100">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl font-extrabold text-choco-900">
                      ₹{currentAnalytics.totalRevenue.toLocaleString('en-IN')}
                    </span>

                    {/* % Change Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isUp
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDown
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-choco-100/80 text-choco-600 border-choco-200'
                      }`}
                    >
                      {isUp ? '↑' : isDown ? '↓' : '—'}{' '}
                      {Math.abs(currentAnalytics.percentChange)}%
                      <span className="text-[10px] opacity-75 font-normal ml-0.5">vs prev period</span>
                    </span>
                  </div>

                  {/* UPI / COD Split & Orders Chips */}
                  <div className="flex items-center gap-2.5 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-choco-100 font-medium text-choco-800 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>UPI:</span>
                      <span className="font-bold">₹{currentAnalytics.upiRevenue.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-choco-100 font-medium text-choco-800 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>COD:</span>
                      <span className="font-bold">₹{currentAnalytics.codRevenue.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-choco-100 font-medium text-choco-800 shadow-2xs">
                      <span>📦 Orders:</span>
                      <span className="font-bold text-choco-900">{currentAnalytics.orders}</span>
                    </div>
                  </div>
                </div>

                {/* Stock-Market Area Chart */}
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentAnalytics.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B3F00" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7B3F00" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        stroke="#A08A7E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#E8DED1' }}
                      />
                      <YAxis
                        stroke="#A08A7E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#5C2C16"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, fill: '#5C2C16', stroke: '#FFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-choco-400 text-sm">Could not load analytics.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-choco-500">Could not load stats.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
