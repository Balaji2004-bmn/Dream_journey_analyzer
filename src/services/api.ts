import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Create axios instance for backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  getDreams: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/dreams', { params }),

  // Get specific dream
  getDream: (id: string) =>
    api.get(`/dreams/${id}`),

  // Create new dream
  createDream: (dreamData: {
    title: string;
    content: string;
    analysis?: any;
    thumbnail_url?: string;
    video_url?: string;
    is_public?: boolean;
  }) =>
    api.post('/dreams', dreamData),

  // Update dream
  updateDream: (id: string, dreamData: any) =>
    api.put(`/dreams/${id}`, dreamData),

  // Delete dream
  deleteDream: (id: string) =>
    api.delete(`/dreams/${id}`),

  // Get public dreams for gallery
  getPublicDreams: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
    api.get('/dreams/public/gallery', { params }),

  // Get dream statistics
  getDreamStats: () =>
    api.get('/dreams/stats/dashboard'),
};

// AI API functions
export const aiAPI = {
  // Analyze dream content
  analyzeDream: (data: { content: string; title?: string }) =>
    api.post('/ai/analyze-dream', data),

  // Extract keywords
  extractKeywords: (data: { content: string }) =>
    api.post('/ai/extract-keywords', data),

  // Suggest titles
  suggestTitle: (data: { content: string }) =>
    api.post('/ai/suggest-title', data),

  // Analyze emotions
  analyzeEmotions: (data: { content: string }) =>
    api.post('/ai/analyze-emotions', data),
};

// Video API functions
export const videoAPI = {
  // Generate video
  generateVideo: (data: {
    dreamContent: string;
    title: string;
    style?: string;
    duration?: number;
  }) =>
    api.post('/video/generate', data),

  // Get video status
  getVideoStatus: (videoId: string) =>
    api.get(`/video/status/${videoId}`),

  // Get user videos
  getMyVideos: (params?: { page?: number; limit?: number }) =>
    api.get('/video/my-videos', { params }),

  // Delete video
  deleteVideo: (videoId: string) =>
    api.delete(`/video/${videoId}`),

  // Get video styles
  getVideoStyles: () =>
    api.get('/video/styles'),
};

// Auth API functions
export const authAPI = {
  // Verify token
  verifyToken: (token: string) =>
    api.post('/auth/verify', { token }),

  // Get profile
  getProfile: () =>
    api.get('/auth/profile'),

  // Update profile
  updateProfile: (data: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    phone?: string;
  }) =>
    api.put('/auth/profile', data),

  // Refresh session
  refreshSession: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
};

export default api;
