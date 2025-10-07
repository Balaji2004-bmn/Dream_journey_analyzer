import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'DreamJourneyMobile/1.0.0',
    'X-Client-Type': 'mobile',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const sessionStr = await AsyncStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
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
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    signup: '/auth/signup',
    signin: '/auth/signin',
    signout: '/auth/signout',
  },
  // Dreams
  dreams: {
    list: '/dreams',
    create: '/dreams',
    generate: '/dreams/generate',
    get: (id) => `/dreams/${id}`,
    delete: (id) => `/dreams/${id}`,
  },
  // AI Analysis
  ai: {
    analyze: '/ai/analyze-dream',
  },
  // Video
  video: {
    generate: '/video-generation/generate',
  },
};
