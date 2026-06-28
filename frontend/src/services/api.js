import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Attach JWT from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifesaver_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lifesaver_token');
      localStorage.removeItem('lifesaver_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;