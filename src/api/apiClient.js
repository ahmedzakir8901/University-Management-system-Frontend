// src/api/apiClient.js
import axios from 'axios';

// ================================================================
// 1. Create the Axios Instance
// ================================================================
const apiClient = axios.create({
  // Reads from .env file. Fallback to localhost if not set.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds — good balance for slow networks
});

// ================================================================
// 2. Request Interceptor — Attach JWT to every request
// ================================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================================================================
// 3. Response Interceptor — Global error handling
// ================================================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Case 1: No response from server (network error, backend down)
    if (!error.response) {
      console.error('[API] Network error — backend may be down');
      // Optionally: toast.error('Cannot reach server. Check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Case 2: 401 Unauthorized — token expired or invalid
    if (status === 401) {
      console.warn('[API] 401 Unauthorized — logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Case 3: 403 Forbidden — user doesn't have permission
    if (status === 403) {
      console.warn('[API] 403 Forbidden — insufficient permissions');
      // Optionally: toast.error('You don\'t have permission to do that');
    }

    // Case 4: 500+ Server errors
    if (status >= 500) {
      console.error('[API] Server error:', error.response.data);
      // Optionally: toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;