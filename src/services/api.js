import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Create axios instance for backend API
// Prefer env var; as a last resort use production backend (avoid baking localhost into build)
const root = (import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${root}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      console.warn('Unauthorized API request');
    }
    return Promise.reject(error);
  }
);

// Dream API functions
export const dreamAPI = {
  // Get user dreams
  getDreams: (params) =>
    api.get('/dreams', { params }),

  // Get specific dream
  getDream: (id) =>
    api.get(`/dreams/${id}`),

  // Create new dream
  createDream: (dreamData) =>
    api.post('/dreams', dreamData),

  // Update dream
  updateDream: (id, dreamData) =>
    api.put(`/dreams/${id}`, dreamData),

  // Delete dream
  deleteDream: (id) =>
    api.delete(`/dreams/${id}`),

  // Get public dreams for gallery
  getPublicDreams: (params) =>
    api.get('/dreams/public/gallery', { params }),

  // Get dream statistics
  getDreamStats: () =>
    api.get('/dreams/stats/dashboard'),
};

// AI API functions
export const aiAPI = {
  // Analyze dream content
  analyzeDream: (data) =>
    api.post('/ai/analyze-dream', data),

  // Extract keywords
  extractKeywords: (data) =>
    api.post('/ai/extract-keywords', data),

  // Suggest titles
  suggestTitle: (data) =>
    api.post('/ai/suggest-title', data),

  // Analyze emotions
  analyzeEmotions: (data) =>
    api.post('/ai/analyze-emotions', data),
};

// Video API functions
export const videoAPI = {
  // Generate video
  generateVideo: (data) =>
    api.post('/video/generate', data),

  // Get video status
  getVideoStatus: (videoId) =>
    api.get(`/video/status/${videoId}`),

  // Get user videos
  getMyVideos: (params) =>
    api.get('/video/my-videos', { params }),

  // Delete video
  deleteVideo: (videoId) =>
    api.delete(`/video/${videoId}`),

  // Get video styles
  getVideoStyles: () =>
    api.get('/video/styles'),
};

// Auth API functions
export const authAPI = {
  // Sign up - now primarily handled by Supabase client, but this can be a fallback or supplemental API
  signUp: (email, password) =>
    api.post('/auth/signup', { email, password }),

  // Sign in - now primarily handled by Supabase client
  signIn: (email, password) =>
    api.post('/auth/signin', { email, password }),

  // Verify token
  verifyToken: (token) =>
    api.post('/auth/verify', { token }),

  // Get profile
  getProfile: () =>
    api.get('/auth/profile'),

  // Update profile
  updateProfile: (data) =>
    api.put('/auth/profile', data),

  // Refresh session
  refreshSession: (refresh_token) =>
    api.post('/auth/refresh', { refresh_token }),
};

export default api;
