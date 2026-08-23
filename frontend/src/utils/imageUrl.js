/**
 * Formats image URLs whether stored as full Cloudinary URLs or local /uploads/ static paths.
 *
 * @param {string} url - Image path or URL
 * @returns {string} Fully qualified image URL
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');

  // Normalize backslashes to forward slashes
  let normalized = url.replace(/\\/g, '/');

  // If path contains /uploads/, extract relative path starting from /uploads/
  const uploadsIdx = normalized.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    normalized = normalized.substring(uploadsIdx);
  } else if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  return `${serverBase}${normalized}`;
};
