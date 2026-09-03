'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDashboardStats } from '@/api/admin';

const StatCard = ({ icon, label, value, color, delay, subtext, to }) => {
  const content = (
    <div className="flex items-center gap-4">
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
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-choco-900">Admin Dashboard</h1>
        <p className="text-choco-500 mt-1">Overview of your chocolate business</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-choco-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="bg-blue-50" delay={0} to="/admin/orders" />
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString('en-IN') || 0}`} color="bg-green-50" delay={0.05} />
          <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="bg-yellow-50" delay={0.1} to="/admin/orders" />
          <StatCard icon="👥" label="Customers" value={stats.totalCustomers} color="bg-purple-50" delay={0.2} />
        </div>
      ) : (
        <p className="text-choco-500">Could not load stats.</p>
      )}
    </div>
  );
}
