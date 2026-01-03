import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cookie'leri gönder
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token'ı header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data)
};

// Manga API
export const mangaAPI = {
  getAll: (params) => api.get('/manga', { params }),
  getBySlug: (slug) => api.get(`/manga/${slug}`),
  create: (data) => api.post('/manga', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (slug, data) => api.put(`/manga/${slug}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (slug) => api.delete(`/manga/${slug}`),
  
  // Chapter
  getChapters: (slug) => api.get(`/manga/${slug}/chapters`),
  getChapter: (mangaSlug, chapterSlug) => api.get(`/manga/${mangaSlug}/chapters/${chapterSlug}`),
  createChapter: (slug, data) => api.post(`/manga/${slug}/chapters`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateChapter: (mangaSlug, chapterSlug, data) => api.put(`/manga/${mangaSlug}/chapters/${chapterSlug}`, data),
  deleteChapter: (mangaSlug, chapterSlug) => api.delete(`/manga/${mangaSlug}/chapters/${chapterSlug}`)
};

// News API
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getBySlug: (slug) => api.get(`/news/${slug}`),
  create: (data) => api.post('/news', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (slug, data) => api.put(`/news/${slug}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (slug) => api.delete(`/news/${slug}`)
};

// Stats API
export const statsAPI = {
  getSiteStats: () => api.get('/stats')
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
};

export default api;