'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { buildWhatsAppUrl } from '@/utils/whatsapp';

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const receiverEmail = 'skshafiullashakhadar@gmail.com';

  const buildMailtoUrl = (name, email, msg) => {
    const subject = encodeURIComponent(`New Inquiry from ${name} - NS Choco Delight`);
    const body = encodeURIComponent(
      `Hello NS Choco Delight Team,\n\n${msg}\n\n-------------------------\nCustomer Name: ${name}\nCustomer Email: ${email}\n-------------------------`
    );
    return `mailto:${receiverEmail}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    const mailtoUrl = buildMailtoUrl(form.name, form.email, form.message);
    window.location.href = mailtoUrl;
    toast.success('Opening your email client to send message to NS Choco Delight! 🍫');
    setSent(true);
  };

  return (
    <div className="py-16 min-h-screen">
      <div className="page-container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="section-title">Get in Touch</h1>
          <p className="section-subtitle">Connect with NS Choco Delight directly via WhatsApp or Email</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <a
              href={buildWhatsAppUrl(user?.name || 'Customer')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 bg-white hover:bg-emerald-50/50 rounded-2xl shadow-sm border border-choco-100 transition-all group block"
            >
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="font-semibold text-choco-900 mb-1">WhatsApp Instant Chat</h3>
                <p className="text-choco-600 text-sm font-medium">+91 81859 20511</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-choco-100">
              <span className="text-3xl">📧</span>
              <div>
                <h3 className="font-semibold text-choco-900 mb-1">Email</h3>
                <p className="text-choco-600 text-sm font-medium">{receiverEmail}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6">
            <h2 className="font-display text-xl font-bold text-choco-900 mb-4">Send a Direct Message</h2>
            <form onSubmit={handleSubmit} id="contact-form">
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="contact-email">Your Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="contact-message">Your Message *</label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="input-field resize-none"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-5 py-3">
                Send via Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
