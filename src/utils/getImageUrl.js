
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${API_BASE_URL}`; 
// (agar Vite use kar rahe ho to baad me env se bhi kar sakte ho)

export const getImageUrl = (path) => {
  if (!path) return "/no-image.png";          // fallback
  if (path.startsWith("http")) return path;   // dummy / external images
  return `${API_BASE}${path}`;                // /images/...
};
