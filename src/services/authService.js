// src/services/authService.js

const USE_MOCK_DATA = true;

// Mock roles (matches your roles table)
const ROLES = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'FACULTY' },
  { id: 3, name: 'STUDENT' },
  { id: 4, name: 'LIBRARIAN' },
];

let mockUsers = [
  { id: 1, email: 'admin@university.edu', role: 'ADMIN' },
];

export const authService = {
  /**
   * Register a new user
   * In real backend, this would call: POST /api/auth/register
   */
  signup: async (userData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 700));

      // Check if email already exists
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('Email is already registered');
      }

      // Simulate successful registration
      const newUser = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      return { success: true, user: newUser };
    }

    // Real backend call (uncomment when backend is ready):
    // const response = await apiClient.post('/auth/register', userData);
    // return response.data;
  },

  /**
   * Get available roles for signup (excludes ADMIN)
   */
  getSignupRoles: async () => {
    await new Promise(r => setTimeout(r, 200));
    // Only allow STUDENT, FACULTY, LIBRARIAN to self-register
    // Admin accounts must be created by existing admins
    return ROLES.filter(r => r.name !== 'ADMIN');
  },

  /**
   * Check if email is available
   */
  isEmailAvailable: async (email) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 300));
      return !mockUsers.some(u => u.email === email);
    }
    // const response = await apiClient.get(`/auth/check-email?email=${email}`);
    // return response.data.available;
  },
};