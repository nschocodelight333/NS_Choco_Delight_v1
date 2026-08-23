import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { buildWhatsAppUrl } from '../utils/whatsapp';

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const receiverEmail = 'skshafiullashakhadar@gmail.com';

  // Construct mailto URL for direct email client opening
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

    // Direct launch mail client to send message to NS Choco Delight
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
          {/* Contact Info */}
          <div>
            <div className="space-y-6">
              {/* WhatsApp Card */}
              <a
                href={buildWhatsAppUrl(user?.name || 'Customer')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-white hover:bg-emerald-50/50 rounded-2xl shadow-sm border border-choco-100 hover:border-emerald-300 transition-all group cursor-pointer block"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
                <div>
                  <h3 className="font-semibold text-choco-900 mb-1 flex items-center gap-2">
                    WhatsApp <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Instant Chat</span>
                  </h3>
                  <p className="text-choco-600 hover:text-emerald-700 transition-colors text-sm font-medium">
                    +91 81859 20511
                  </p>
                  <p className="text-xs text-choco-400 mt-1">Click to start direct chat on WhatsApp</p>
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${receiverEmail}?subject=${encodeURIComponent('Inquiry for NS Choco Delight')}`}
                className="flex items-start gap-4 p-5 bg-white hover:bg-amber-50/50 rounded-2xl shadow-sm border border-choco-100 hover:border-amber-300 transition-all group cursor-pointer block"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">📧</span>
                <div>
                  <h3 className="font-semibold text-choco-900 mb-1 flex items-center gap-2">
                    Email <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Direct Mail</span>
                  </h3>
                  <p className="text-choco-600 hover:text-amber-800 transition-colors text-sm font-medium break-all">
                    {receiverEmail}
                  </p>
                  <p className="text-xs text-choco-400 mt-1">Click to send direct email to NS Choco</p>
                </div>
              </a>

              {/* Location Card */}
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-choco-100">
                <span className="text-3xl">📍</span>
                <div>
                  <h3 className="font-semibold text-choco-900 mb-1">Location</h3>
                  <p className="text-choco-600 text-sm">Tadepalligudem, Andhra Pradesh, India</p>
                </div>
              </div>
            </div>

            {/* Quick Action Button: WhatsApp */}
            <a
              href={buildWhatsAppUrl(form.name || user?.name || 'Customer', form.message)}
              target="_blank"
              rel="noopener noreferrer"
              id="contact-whatsapp-btn"
              className="inline-flex items-center justify-center gap-2 mt-6 w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Direct Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6">
            <h2 className="font-display text-xl font-bold text-choco-900 mb-2">Send a Direct Message</h2>
            <p className="text-choco-500 text-xs mb-5">
              Messages will open in your email client addressed to <strong className="text-choco-800">{receiverEmail}</strong>
            </p>

            {sent ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-4">📧</span>
                <p className="text-choco-900 font-semibold mb-2">Ready to Send!</p>
                <p className="text-choco-600 text-sm mb-4">
                  Your mail app has been opened with your message addressed to <strong>{receiverEmail}</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={buildMailtoUrl(form.name || 'Customer', form.email, form.message)}
                    className="btn-primary text-xs py-2.5 px-4"
                  >
                    Re-open Email App
                  </a>
                  <a
                    href={buildWhatsAppUrl(form.name || user?.name || 'Customer', form.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    Send via WhatsApp
                  </a>
                </div>

                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: '', email: '', message: '' });
                  }}
                  className="text-choco-500 hover:text-choco-800 text-xs underline mt-4 block mx-auto"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="contact-form">
                <div className="space-y-4">
                  <div>
                    <label className="label" htmlFor="contact-name">Your Name *</label>
                    <input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Rahul Sharma"
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
                      placeholder="e.g. rahul@gmail.com"
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
                      placeholder="Type your query or custom chocolate order request..."
                      required
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <button type="submit" id="contact-submit-btn" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <span>📧</span> Send via Direct Email
                  </button>

                  <a
                    href={buildWhatsAppUrl(form.name || user?.name || 'Customer', form.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <span>💬</span> Send via WhatsApp Instead
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
