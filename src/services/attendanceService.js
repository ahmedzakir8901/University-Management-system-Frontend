// src/services/attendanceService.js

const mockCourses = [
  { id: 1, code: 'CS101', title: 'Intro to Programming' },
  { id: 2, code: 'MATH201', title: 'Linear Algebra' },
  { id: 3, code: 'PHY101', title: 'Physics I' },
];

const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

export const attendanceService = {
  // Get all courses for the dropdown
  getCourses: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCourses;
  },

  // Get students enrolled in a specific course (simulated)
  getStudentsByCourse: async (courseId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // In the real backend, this will be an API call like: GET /api/sections/{courseId}/students
    // For now, we return all mock students for any selected course
    return mockStudents;
  },

  // Save attendance (will POST to backend later)
  saveAttendance: async (attendanceData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('Saving attendance:', attendanceData);
    return { success: true, message: 'Attendance saved!' };
  },
};