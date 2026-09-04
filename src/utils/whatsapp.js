export const getWhatsAppNumber = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('store_whatsapp_number');
    if (saved && saved.trim()) return saved.trim();
  }
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918185920511';
};

export const setWhatsAppNumber = (number) => {
  const clean = number ? String(number).replace(/\D/g, '') : '';
  if (typeof window !== 'undefined' && clean) {
    localStorage.setItem('store_whatsapp_number', clean);
    // Dispatch event so active components re-render immediately
    window.dispatchEvent(new CustomEvent('whatsapp_number_changed', { detail: clean }));
  }
  return clean;
};

export const fetchStoreWhatsAppNumber = async () => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.settings?.store_whatsapp_number) {
        const num = data.settings.store_whatsapp_number;
        setWhatsAppNumber(num);
        return num;
      }
    }
  } catch (err) {
    console.error('Failed to fetch remote store whatsapp number:', err);
  }
  return getWhatsAppNumber();
};

export const buildWhatsAppUrl = (param1 = '', param2 = '') => {
  const whatsappNumber = getWhatsAppNumber();

  let name = '';
  let message = '';

  if (typeof param1 === 'object' && param1 !== null) {
    name = param1.name || '';
    message = param1.message || '';
  } else if (param1 && !param2 && (param1.includes(' ') || param1.length > 20 || param1.toLowerCase().includes('order') || param1.toLowerCase().includes('hi'))) {
    message = param1;
  } else {
    name = param1;
    message = param2;
  }

  // Get user name from localStorage if available
  if (!name || name === 'Customer') {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) name = parsed.name;
        }
      }
    } catch (e) {}
  }

  const finalName = name && name.trim() ? name.trim() : '';
  const greeting = finalName
    ? `Hello NS Choco Delight! 🍫\nMy name is *${finalName}*.`
    : `Hello NS Choco Delight! 🍫`;

  if (message && message.trim()) {
    const cleanMsg = message.trim().replace(/^Hi!\s*/i, '');
    const text = `${greeting}\n\nI would like to connect regarding:\n*${cleanMsg}*\n\nPlease let me know the details and availability. Thank you! 🙏`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  const defaultText = `${greeting}\n\nI would like to place an order or inquire about your handcrafted chocolates.\n\nPlease share your current catalog and availability. Thank you! ✨`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultText)}`;
};
