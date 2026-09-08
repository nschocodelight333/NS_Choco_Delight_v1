'use client';

import { useState, useEffect } from 'react';

let cachedWhatsAppNumber = null;

export const getWhatsAppNumber = () => {
  if (cachedWhatsAppNumber) return cachedWhatsAppNumber;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('store_whatsapp_number');
    if (saved && saved.trim()) {
      cachedWhatsAppNumber = saved.trim().replace(/\D/g, '');
      return cachedWhatsAppNumber;
    }
  }
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918185920511').replace(/\D/g, '');
};

export const setWhatsAppNumber = (number) => {
  const clean = number ? String(number).replace(/\D/g, '') : '';
  if (clean) {
    cachedWhatsAppNumber = clean;
    if (typeof window !== 'undefined') {
      localStorage.setItem('store_whatsapp_number', clean);
      window.dispatchEvent(new CustomEvent('whatsapp_number_changed', { detail: clean }));
    }
  }
  return clean;
};

export const fetchStoreWhatsAppNumber = async () => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.settings?.store_whatsapp_number) {
        const num = String(data.settings.store_whatsapp_number).replace(/\D/g, '');
        if (num) {
          setWhatsAppNumber(num);
          return num;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch remote store whatsapp number:', err);
  }
  return getWhatsAppNumber();
};

export const useStoreWhatsApp = () => {
  const [number, setNumber] = useState(getWhatsAppNumber());

  useEffect(() => {
    fetchStoreWhatsAppNumber().then((n) => {
      if (n) setNumber(n);
    });

    const handler = (e) => {
      if (e.detail) setNumber(e.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('whatsapp_number_changed', handler);
      return () => window.removeEventListener('whatsapp_number_changed', handler);
    }
  }, []);

  return number;
};

export const formatPhoneNumber = (num) => {
  if (!num) return '+91 81859 20511';
  const clean = String(num).replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  if (clean.length === 12 && clean.startsWith('91')) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return `+${clean}`;
};

export const buildWhatsAppUrl = (param1 = '', param2 = '') => {
  let targetNumber = '';
  let message = '';
  let customerName = '';

  // Determine arguments
  if (typeof param1 === 'object' && param1 !== null) {
    customerName = param1.name || '';
    message = param1.message || '';
    targetNumber = param1.number || getWhatsAppNumber();
  } else if (typeof param1 === 'string' && /^\+?[0-9]{7,15}$/.test(param1.trim())) {
    targetNumber = param1.trim().replace(/\D/g, '');
    message = param2 || '';
  } else if (param1 && !param2) {
    targetNumber = getWhatsAppNumber();
    message = param1;
  } else {
    customerName = param1 || '';
    message = param2 || '';
    targetNumber = getWhatsAppNumber();
  }

  if (!targetNumber) {
    targetNumber = getWhatsAppNumber();
  }

  // Ensure clean digits only
  targetNumber = targetNumber.replace(/\D/g, '');
  if (targetNumber.length === 10) {
    targetNumber = `91${targetNumber}`;
  }

  // Try to retrieve logged in customer name if not provided
  if (!customerName || customerName === 'Customer') {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) customerName = parsed.name;
        }
      }
    } catch (e) {}
  }

  const finalName = customerName && customerName.trim() ? customerName.trim() : '';
  const greeting = finalName
    ? `Hello NS Choco Delight! 🍫\nMy name is *${finalName}*.`
    : `Hello NS Choco Delight! 🍫`;

  if (message && message.trim()) {
    const cleanMsg = message.trim().replace(/^Hi!\s*/i, '');
    const text = `${greeting}\n\n${cleanMsg}\n\nPlease let me know the details and availability. Thank you! 🙏`;
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`;
  }

  const defaultText = `${greeting}\n\nI would like to place an order or inquire about your handcrafted chocolates.\n\nPlease share your current catalog and availability. Thank you! ✨`;
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(defaultText)}`;
};
