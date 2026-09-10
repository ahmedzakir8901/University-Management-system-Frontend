// src/services/sectionService.js

let mockSections = [
  { id: 1, courseId: 1, termId: 1, sectionName: 'A', facultyId: 1, maxCapacity: 40, currentEnrollment: 25 },
  { id: 2, courseId: 1, termId: 1, sectionName: 'B', facultyId: 2, maxCapacity: 35, currentEnrollment: 30 },
  { id: 3, courseId: 2, termId: 1, sectionName: 'A', facultyId: 1, maxCapacity: 50, currentEnrollment: 48 },
];

let mockSchedules = [
  { id: 1, sectionId: 1, roomId: 1, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30' },
  { id: 2, sectionId: 1, roomId: 1, dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '10:30' },
  { id: 3, sectionId: 2, roomId: 2, dayOfWeek: 'TUESDAY', startTime: '11:00', endTime: '12:30' },
];

// Helper data for dropdowns (later this comes from their own services/APIs)
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Intro to Programming' },
  { id: 2, code: 'MATH201', title: 'Linear Algebra' },
  { id: 3, code: 'PHY101', title: 'Physics I' },
];

const mockFaculty = [
  { id: 1, employeeId: 'FAC001', firstName: 'Robert', lastName: 'Smith' },
  { id: 2, employeeId: 'FAC002', firstName: 'Maria', lastName: 'Garcia' },
];

const mockTerms = [
  { id: 1, name: 'Fall 2026', termCode: 'FALL26' },
  { id: 2, name: 'Spring 2027', termCode: 'SPRING27' },
];

const mockRooms = [
  { id: 1, roomNumber: '101', capacity: 60 },
  { id: 2, roomNumber: '102', capacity: 40 },
  { id: 3, roomNumber: 'LAB-A', capacity: 30 },
];

export const sectionService = {
  // Sections
  getSections: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockSections;
  },
  createSection: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newSection = { id: Date.now(), currentEnrollment: 0, ...data };
    mockSections.push(newSection);
    return newSection;
  },
  updateSection: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockSections.findIndex(s => s.id === id);
    if (idx !== -1) mockSections[idx] = { ...mockSections[idx], ...data };
    return mockSections[idx];
  },
  deleteSection: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockSections = mockSections.filter(s => s.id !== id);
    return { success: true };
  },

  // Schedules
  getSchedules: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockSchedules;
  },
  createSchedule: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newSchedule = { id: Date.now(), ...data };
    mockSchedules.push(newSchedule);
    return newSchedule;
  },
  updateSchedule: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockSchedules.findIndex(s => s.id === id);
    if (idx !== -1) mockSchedules[idx] = { ...mockSchedules[idx], ...data };
    return mockSchedules[idx];
  },
  deleteSchedule: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockSchedules = mockSchedules.filter(s => s.id !== id);
    return { success: true };
  },

  // Lookup helpers for dropdowns
  getCourses: async () => mockCourses,
  getFaculty: async () => mockFaculty,
  getTerms: async () => mockTerms,
  getRooms: async () => mockRooms,
};