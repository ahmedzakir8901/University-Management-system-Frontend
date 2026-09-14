// src/services/authService.js

const USE_MOCK_DATA = true;

// Mock roles (matches your roles table)
const ROLES = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'FACULTY' },
  { id: 3, name: 'STUDENT' },
  { id: 4, name: 'LIBRARIAN' },
];

// Mock users — added `password` field so reset flow can update it
let mockUsers = [
  { id: 1, email: 'admin@university.edu', role: 'ADMIN', password: 'admin123' },
];

// Mock OTP for testing (in real backend, sent via email/SMS)
const MOCK_OTP = '123456';

export const authService = {
  // ============================================================
  // EXISTING METHODS (unchanged)
  // ============================================================

  /**
   * Register a new user
   * Real backend: POST /api/auth/register
   */
  signup: async (userData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 700));

      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('Email is already registered');
      }

      const newUser = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        password: userData.password, // Store password for mock reset flow
        createdAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      return { success: true, user: newUser };
    }
    // const response = await apiClient.post('/auth/register', userData);
    // return response.data;
  },

  /**
   * Get available roles for signup (excludes ADMIN)
   */
  getSignupRoles: async () => {
    await new Promise(r => setTimeout(r, 200));
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

  // ============================================================
  // NEW: FORGOT PASSWORD METHODS
  // ============================================================

  /**
   * Step 1: Request password reset — sends OTP to email
   * Real backend: POST /api/auth/forgot-password
   *
   * ⚠️ SECURITY NOTE: In production, always return success even if email
   * doesn't exist (to prevent attackers from enumerating valid emails).
   * We throw an error here only because this is a mock for learning.
   */
  requestPasswordReset: async (email) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 800));

      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('No account found with this email');
      }

      // In real backend, OTP is generated server-side and sent via email
      console.log(`[MOCK] OTP sent to ${email}: ${MOCK_OTP}`);
      return {
        success: true,
        message: 'OTP sent to your email',
        // ⚠️ Only for mock testing — DO NOT return OTP in real backend!
        mockOtp: MOCK_OTP,
      };
    }
    // const response = await apiClient.post('/auth/forgot-password', { email });
    // return response.data;
  },

  /**
   * Step 2: Verify OTP
   * Real backend: POST /api/auth/verify-otp
   */
  verifyOtp: async (email, otp) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 600));

      if (otp !== MOCK_OTP) {
        throw new Error('Invalid or expired OTP');
      }

      return {
        success: true,
        // In real backend, this would be a short-lived JWT reset token
        resetToken: 'mock-reset-token-' + Date.now(),
      };
    }
    // const response = await apiClient.post('/auth/verify-otp', { email, otp });
    // return response.data;
  },

  /**
   * Step 3: Reset password with new password
   * Real backend: POST /api/auth/reset-password
   */
  resetPassword: async (email, newPassword, resetToken) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 700));

      const userIndex = mockUsers.findIndex(u => u.email === email);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // In real backend: hash the password with BCrypt before saving
      mockUsers[userIndex].password = newPassword;
      return { success: true, message: 'Password reset successfully' };
    }
    // const response = await apiClient.post('/auth/reset-password', {
    //   email, newPassword, resetToken
    // });
    // return response.data;
  },
};