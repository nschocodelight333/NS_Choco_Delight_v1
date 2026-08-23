import { useState, useEffect } from 'react';
import { getCustomers } from '../../api/admin';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCustomers()
      .then((res) => setCustomers(res.data.customers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-choco-900">Customers Directory</h1>
        <p className="text-choco-500 text-xs sm:text-sm mt-1">{customers.length} registered customers</p>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pr-10 text-sm"
          id="admin-customer-search"
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-choco-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Mobile Stacked Card View (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((customer) => (
              <div key={customer._id} className="bg-white p-4 rounded-2xl border border-choco-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-choco-gradient flex items-center justify-center text-cream font-bold text-sm flex-shrink-0 shadow-xs">
                    {customer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-choco-900 text-sm truncate">{customer.name}</p>
                    <p className="text-choco-500 text-xs truncate">{customer.email}</p>
                  </div>
                </div>

                <div className="text-xs text-choco-600 space-y-1 pt-2 border-t border-choco-50">
                  <p><span className="font-medium text-choco-700">Phone:</span> {customer.phone || 'N/A'}</p>
                  <p><span className="font-medium text-choco-700">Joined:</span> {new Date(customer.createdAt).toLocaleDateString('en-IN')}</p>
                </div>

                {customer.phone && (
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={`tel:${customer.phone}`}
                      className="btn-secondary flex-1 py-2 text-xs min-h-[40px]"
                    >
                      📞 Call Customer
                    </a>
                    <a
                      href={buildWhatsAppUrl('Hello! Reaching out from NS Choco Delight.', customer.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold flex-1 py-2 text-xs min-h-[40px] shadow-xs"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-choco-100 text-choco-400 text-sm">
                No customers found.
              </div>
            )}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-choco-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-choco-100 bg-choco-50">
                    <th className="text-left px-5 py-3 text-choco-700 font-semibold">Customer</th>
                    <th className="text-left px-5 py-3 text-choco-700 font-semibold">Email</th>
                    <th className="text-left px-5 py-3 text-choco-700 font-semibold">Phone</th>
                    <th className="text-left px-5 py-3 text-choco-700 font-semibold">Joined</th>
                    <th className="text-right px-5 py-3 text-choco-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer._id} className="border-b border-choco-50 last:border-0 hover:bg-choco-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-choco-gradient flex items-center justify-center text-cream font-bold text-sm flex-shrink-0">
                            {customer.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-choco-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-choco-600">{customer.email}</td>
                      <td className="px-5 py-3 text-choco-600">{customer.phone || '—'}</td>
                      <td className="px-5 py-3 text-choco-400 text-xs">
                        {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {customer.phone ? (
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`tel:${customer.phone}`}
                              className="px-3 py-1 rounded-lg border border-choco-200 text-choco-700 text-xs font-semibold hover:bg-choco-100"
                            >
                              📞 Call
                            </a>
                            <a
                              href={buildWhatsAppUrl('Hello! Reaching out from NS Choco Delight.', customer.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 shadow-xs"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-choco-400">No customers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCustomers;
