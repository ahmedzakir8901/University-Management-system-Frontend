import apiClient from '../api/apiClient';

export const authService = {
  login: async (email, password) => {
    // POST http://localhost:8080/api/auth/login
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // This will contain the JWT token and user object
  },
};