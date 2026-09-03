'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDashboardStats } from '@/api/admin';

const StatCard = ({ icon, label, value, color, delay, subtext, to }) => {
  const content = (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-choco-500 text-[10px] sm:text-xs font-medium truncate">{label}</p>
        <p className="font-display text-lg sm:text-2xl font-bold text-choco-900 mt-0.5 truncate">{value}</p>
        {subtext && <p className="text-[10px] sm:text-[11px] text-choco-400 mt-0.5 font-medium leading-tight truncate">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-choco-100 p-3.5 sm:p-5 hover:border-choco-300 transition-all cursor-pointer"
    >
      {to ? <Link href={to} className="block">{content}</Link> : content}
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-choco-900">Admin Dashboard</h1>
        <p className="text-choco-500 text-xs sm:text-base mt-0.5">Overview of your chocolate business</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-choco-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="bg-blue-50" delay={0} to="/admin/orders" />
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString('en-IN') || 0}`} color="bg-green-50" delay={0.05} />
          <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="bg-yellow-50" delay={0.1} to="/admin/orders" />
          <StatCard icon="👥" label="Customers" value={stats.totalCustomers} color="bg-purple-50" delay={0.2} />
        </div>
      ) : (
        <p className="text-choco-500 text-xs sm:text-base">Could not load stats.</p>
      )}
    </div>
  );
}
