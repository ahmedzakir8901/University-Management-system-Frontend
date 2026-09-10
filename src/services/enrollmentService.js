// src/services/enrollmentService.js

let mockEnrollments = [
  { id: 1, studentId: 1, sectionId: 1, enrollmentStatus: 'ENROLLED', enrolledAt: '2026-09-01T10:00:00Z' },
  { id: 2, studentId: 2, sectionId: 1, enrollmentStatus: 'ENROLLED', enrolledAt: '2026-09-01T10:15:00Z' },
  { id: 3, studentId: 3, sectionId: 2, enrollmentStatus: 'DROPPED', enrolledAt: '2026-09-01T11:00:00Z' },
  { id: 4, studentId: 4, sectionId: 2, enrollmentStatus: 'ENROLLED', enrolledAt: '2026-09-02T09:00:00Z' },
];

let mockWaitlists = [
  { id: 1, sectionId: 3, studentId: 1, position: 1, requestedAt: '2026-09-03T10:00:00Z' },
  { id: 2, sectionId: 3, studentId: 2, position: 2, requestedAt: '2026-09-03T10:30:00Z' },
];

// Lookup data (will be replaced by real API later)
const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

const mockSections = [
  { id: 1, courseId: 1, termId: 1, sectionName: 'A' },
  { id: 2, courseId: 1, termId: 1, sectionName: 'B' },
  { id: 3, courseId: 2, termId: 1, sectionName: 'A' },
];

const mockCourses = [
  { id: 1, code: 'CS101', title: 'Intro to Programming' },
  { id: 2, code: 'MATH201', title: 'Linear Algebra' },
];

export const enrollmentService = {
  // === Enrollments ===
  getEnrollments: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockEnrollments;
  },
  createEnrollment: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newEnrollment = {
      id: Date.now(),
      enrolledAt: new Date().toISOString(),
      enrollmentStatus: 'ENROLLED',
      ...data,
    };
    mockEnrollments.push(newEnrollment);
    return newEnrollment;
  },
  updateEnrollmentStatus: async (id, status) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockEnrollments.findIndex(e => e.id === id);
    if (idx !== -1) mockEnrollments[idx] = { ...mockEnrollments[idx], enrollmentStatus: status };
    return mockEnrollments[idx];
  },
  deleteEnrollment: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockEnrollments = mockEnrollments.filter(e => e.id !== id);
    return { success: true };
  },

  // === Waitlists ===
  getWaitlists: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockWaitlists;
  },
  createWaitlist: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newWaitlist = {
      id: Date.now(),
      requestedAt: new Date().toISOString(),
      ...data,
    };
    mockWaitlists.push(newWaitlist);
    return newWaitlist;
  },
  removeFromWaitlist: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockWaitlists = mockWaitlists.filter(w => w.id !== id);
    return { success: true };
  },

  // Lookup helpers
  getStudents: async () => mockStudents,
  getSections: async () => mockSections,
  getCourses: async () => mockCourses,
};