// src/services/profileService.js

const USE_MOCK_DATA = true;

// Mock current user — in real app, this comes from the backend based on JWT
let mockProfile = {
  id: 1,
  firstName: 'Haseeb',
  lastName: 'Ahmad',
  email: 'admin@university.edu',
  phone: '+92-300-1234567',
  gender: 'MALE',
  dateOfBirth: '1995-05-15',
  address: 'Lahore, Pakistan',
  profilePictureUrl: null,
  role: 'ADMIN',
  department: 'Administration',
  joinedAt: '2024-01-15T09:00:00Z',
  lastLogin: new Date().toISOString(),
};

export const profileService = {
  getProfile: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockProfile;
    }
    // Real API call later:
    // const response = await apiClient.get('/profile');
    // return response.data;
  },

  updateProfile: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockProfile = { ...mockProfile, ...data };
      return mockProfile;
    }
    // const response = await apiClient.put('/profile', data);
    // return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 600));
      // Mock validation
      if (currentPassword !== 'admin123') {
        throw new Error('Current password is incorrect');
      }
      return { success: true };
    }
    // const response = await apiClient.post('/profile/change-password', {
    //   currentPassword, newPassword
    // });
    // return response.data;
  },

  uploadAvatar: async (file) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 800));
      // Return a fake URL — in real app, backend receives file and returns actual URL
      return { url: URL.createObjectURL(file) };
    }
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await apiClient.post('/profile/avatar', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return response.data;
  },
};