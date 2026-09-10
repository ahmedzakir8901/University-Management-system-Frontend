import axios from 'axios';

// 1. Create the Axios Instance
const apiClient = axios.create({
  // This is the base URL for your backend. 
  // CHANGE THIS to your actual backend URL when it's ready.
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Wait for 10 seconds before failing
});

// 2. Request Interceptor (Before request is sent)
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (set during login)
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

// 3. Response Interceptor (After response is received)
apiClient.interceptors.response.use(
  (response) => {
    // You can customize response here if needed
    return response;
  },
  (error) => {
    // If the backend returns 401 (Unauthorized), it means the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Force redirect
    }
    
    // You can show a generic error message here if you want
    return Promise.reject(error);
  }
);

export default apiClient;