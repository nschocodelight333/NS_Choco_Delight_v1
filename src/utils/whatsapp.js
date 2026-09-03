export const buildWhatsAppUrl = (customerName = '', customMessage = '') => {
  const whatsappNumber = '918185920511';

  let name = customerName;

  if (!name || name === 'Customer') {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) {
            name = parsed.name;
          }
        }
      }
    } catch (e) {}
  }

  const finalName = name && name.trim() ? name.trim() : 'Customer';

  if (customMessage && customMessage.trim()) {
    const text = encodeURIComponent(
      `Hi NS Choco Delight! 👋 I'm ${finalName}, and I'd like to connect with you.\n\n${customMessage.trim()}`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  }

  const menuText = `Hi NS Choco Delight! 👋 I'm ${finalName}, and I'd like to connect with you. Please choose an option:\n\n1. I need some inquiry ❓\n2. I want to order 🛒\n3. I need an update 📦\n4. Issue regarding my order ⚠️\n\nReply with the number that fits your need! 😊`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(menuText)}`;
};
