import axios from 'axios';

const api = axios.create({
  // Callers already include /api, so production must use the origin root.
  baseURL: import.meta.env.PROD ? '/' : (import.meta.env.VITE_API_URL || 'http://localhost:5001'),
  timeout: 20000,
});

export default api;
