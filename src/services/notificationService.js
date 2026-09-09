// src/services/notificationService.js

const mockAnnouncements = [
  { id: 1, title: "Fall Semester Begins", content: "Welcome back to campus! Classes start on September 10.", targetRole: "ALL", createdBy: "Admin", createdAt: "2026-09-01T10:00:00Z" },
  { id: 2, title: "Midterm Exam Schedule", content: "Midterm exams for CS courses are scheduled for next week.", targetRole: "FACULTY", createdBy: "Registrar", createdAt: "2026-09-02T14:30:00Z" },
  { id: 3, title: "Library Hours Extended", content: "The library will remain open until midnight during finals week.", targetRole: "STUDENT", createdBy: "Librarian", createdAt: "2026-09-03T09:15:00Z" },
];

const mockNotifications = [
  { id: 1, title: "Fee Reminder", message: "Your tuition fee for Fall 2026 is due soon.", isRead: false, createdAt: "2026-09-05T09:00:00Z" },
  { id: 2, title: "Grade Posted", message: "Your grade for CS101 has been published.", isRead: false, createdAt: "2026-09-06T15:00:00Z" },
];

export const notificationService = {
  // Get all announcements
  getAnnouncements: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAnnouncements;
  },

  // Create a new announcement
  createAnnouncement: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAnnouncement = {
      id: Date.now(),
      createdBy: "Admin", // In real app, this comes from the logged-in user
      createdAt: new Date().toISOString(),
      ...data,
    };
    mockAnnouncements.push(newAnnouncement);
    return newAnnouncement;
  },

  // Delete an announcement
  deleteAnnouncement: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAnnouncements.findIndex(a => a.id === id);
    if (index !== -1) mockAnnouncements.splice(index, 1);
    return { success: true };
  },

  // Get notifications for the logged-in user
  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In the real backend, this will filter by user_id!
    return mockNotifications;
  },
};