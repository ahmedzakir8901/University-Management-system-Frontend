// src/services/facultyService.js
import apiClient from '../api/apiClient';

// ================================================================
// 🔑 THE TOGGLE: Change this to `false` when the backend is ready!
// ================================================================
const USE_MOCK_DATA = true;

// ============ MOCK DEPARTMENTS (for dropdowns) ============
export const mockDepartments = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Mathematics', code: 'MATH' },
  { id: 3, name: 'Physics', code: 'PHY' },
  { id: 4, name: 'Chemistry', code: 'CHEM' },
  { id: 5, name: 'Biology', code: 'BIO' },
];

// ============ MOCK FACULTY (basic list) ============
let mockFaculty = [
  { id: 1, employeeId: 'FAC001', firstName: 'Robert', lastName: 'Smith', email: 'robert.smith@university.edu', departmentId: 1, designation: 'Professor', joiningDate: '2015-08-15', officeRoom: 'CS-201', specialization: 'Artificial Intelligence' },
  { id: 2, employeeId: 'FAC002', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@university.edu', departmentId: 2, designation: 'Associate Professor', joiningDate: '2018-01-10', officeRoom: 'MATH-105', specialization: 'Algebra' },
  { id: 3, employeeId: 'FAC003', firstName: 'James', lastName: 'Brown', email: 'james.brown@university.edu', departmentId: 3, designation: 'Lecturer', joiningDate: '2021-09-01', officeRoom: 'PHY-310', specialization: 'Quantum Mechanics' },
];

// ============ RICH MOCK DETAILS (for the Faculty Details Modal) ============
const mockFacultyDetails = {
  1: {
    phone: '+92-300-1111111',
    qualification: 'PhD in Computer Science, MIT',
    status: 'ACTIVE',
    sections: [
      { id: 1, courseCode: 'CS101', courseTitle: 'Introduction to Programming', sectionName: 'A', currentEnrollment: 25, maxCapacity: 40 },
      { id: 2, courseCode: 'CS305', courseTitle: 'Artificial Intelligence', sectionName: 'A', currentEnrollment: 18, maxCapacity: 30 },
    ],
    timetable: [
      { id: 1, day: 'MONDAY', startTime: '09:00', endTime: '10:30', courseCode: 'CS101', sectionName: 'A', room: '101' },
      { id: 2, day: 'MONDAY', startTime: '11:00', endTime: '12:30', courseCode: 'CS305', sectionName: 'A', room: '205' },
      { id: 3, day: 'WEDNESDAY', startTime: '09:00', endTime: '10:30', courseCode: 'CS101', sectionName: 'A', room: '101' },
      { id: 4, day: 'THURSDAY', startTime: '14:00', endTime: '16:00', courseCode: 'CS305', sectionName: 'A', room: 'LAB-C' },
    ],
    students: [
      { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe', courseCode: 'CS101', sectionName: 'A' },
      { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith', courseCode: 'CS101', sectionName: 'A' },
      { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown', courseCode: 'CS305', sectionName: 'A' },
      { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson', courseCode: 'CS305', sectionName: 'A' },
    ],
    evaluations: {
      avgTeaching: 4.6,
      avgContent: 4.3,
      avgOverall: 4.5,
      totalSubmissions: 22,
      recent: [
        { id: 1, studentName: 'John Doe', courseCode: 'CS101', ratingTeaching: 5, ratingContent: 4, ratingOverall: 5, comments: 'Excellent teaching style and very helpful.', submittedAt: '2025-12-20' },
        { id: 2, studentName: 'Jane Smith', courseCode: 'CS101', ratingTeaching: 4, ratingContent: 4, ratingOverall: 4, comments: 'Good course, would recommend.', submittedAt: '2025-12-20' },
        { id: 3, studentName: 'Bob Brown', courseCode: 'CS305', ratingTeaching: 5, ratingContent: 5, ratingOverall: 5, comments: 'Best AI course I have taken!', submittedAt: '2025-12-21' },
      ],
    },
    invigilations: [
      { id: 1, courseCode: 'MATH201', examType: 'MIDTERM', examDate: '2026-10-20', startTime: '09:00', endTime: '11:00', room: '101' },
      { id: 2, courseCode: 'PHY101', examType: 'FINAL', examDate: '2026-12-15', startTime: '14:00', endTime: '17:00', room: 'AUD-1' },
    ],
  },
  2: {
    phone: '+92-300-2222222',
    qualification: 'PhD in Mathematics, Oxford University',
    status: 'ACTIVE',
    sections: [
      { id: 3, courseCode: 'MATH201', courseTitle: 'Linear Algebra', sectionName: 'A', currentEnrollment: 30, maxCapacity: 40 },
      { id: 4, courseCode: 'MATH301', courseTitle: 'Abstract Algebra', sectionName: 'A', currentEnrollment: 20, maxCapacity: 30 },
    ],
    timetable: [
      { id: 1, day: 'TUESDAY', startTime: '10:00', endTime: '11:30', courseCode: 'MATH201', sectionName: 'A', room: '205' },
      { id: 2, day: 'WEDNESDAY', startTime: '14:00', endTime: '15:30', courseCode: 'MATH301', sectionName: 'A', room: '210' },
    ],
    students: [
      { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe', courseCode: 'MATH201', sectionName: 'A' },
      { id: 5, rollNumber: 'STU005', firstName: 'Carlos', lastName: 'Rivera', courseCode: 'MATH201', sectionName: 'A' },
      { id: 6, rollNumber: 'STU006', firstName: 'Priya', lastName: 'Patel', courseCode: 'MATH301', sectionName: 'A' },
    ],
    evaluations: {
      avgTeaching: 4.8,
      avgContent: 4.7,
      avgOverall: 4.8,
      totalSubmissions: 28,
      recent: [
        { id: 1, studentName: 'John Doe', courseCode: 'MATH201', ratingTeaching: 5, ratingContent: 5, ratingOverall: 5, comments: 'Dr. Garcia makes complex topics easy to understand.', submittedAt: '2025-12-19' },
      ],
    },
    invigilations: [
      { id: 1, courseCode: 'CS101', examType: 'MIDTERM', examDate: '2026-10-18', startTime: '09:00', endTime: '11:00', room: '205' },
    ],
  },
  3: {
    phone: '+92-300-3333333',
    qualification: 'MSc in Physics, University of Tokyo',
    status: 'ACTIVE',
    sections: [
      { id: 5, courseCode: 'PHY101', courseTitle: 'Physics I', sectionName: 'A', currentEnrollment: 35, maxCapacity: 50 },
    ],
    timetable: [
      { id: 1, day: 'MONDAY', startTime: '14:00', endTime: '16:00', courseCode: 'PHY101', sectionName: 'A', room: 'LAB-A' },
      { id: 2, day: 'FRIDAY', startTime: '10:00', endTime: '11:30', courseCode: 'PHY101', sectionName: 'A', room: '301' },
    ],
    students: [
      { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson', courseCode: 'PHY101', sectionName: 'A' },
      { id: 7, rollNumber: 'STU007', firstName: 'David', lastName: 'Lee', courseCode: 'PHY101', sectionName: 'A' },
    ],
    evaluations: {
      avgTeaching: 4.2,
      avgContent: 4.4,
      avgOverall: 4.3,
      totalSubmissions: 30,
      recent: [
        { id: 1, studentName: 'Alice Johnson', courseCode: 'PHY101', ratingTeaching: 4, ratingContent: 5, ratingOverall: 4, comments: 'Great content, but pacing was fast.', submittedAt: '2025-12-22' },
      ],
    },
    invigilations: [],
  },
};

// ============ SERVICE (works for both mock & real) ============
export const facultyService = {
  getAllFaculty: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      return mockFaculty;
    }
    const response = await apiClient.get('/faculty');
    return response.data;
  },

  getFacultyById: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const faculty = mockFaculty.find(f => f.id === id);
      if (!faculty) throw new Error('Faculty not found');
      return { ...faculty, ...(mockFacultyDetails[id] || {}) };
    }
    const response = await apiClient.get(`/faculty/${id}`);
    return response.data;
  },

  getAllDepartments: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 200));
      return mockDepartments;
    }
    const response = await apiClient.get('/departments');
    return response.data;
  },

  createFaculty: async (facultyData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const newFaculty = { id: Date.now(), ...facultyData };
      mockFaculty.push(newFaculty);
      return newFaculty;
    }
    const response = await apiClient.post('/faculty', facultyData);
    return response.data;
  },

  updateFaculty: async (id, updatedData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const index = mockFaculty.findIndex((f) => f.id === id);
      if (index !== -1) {
        mockFaculty[index] = { ...mockFaculty[index], ...updatedData };
        return mockFaculty[index];
      }
      throw new Error('Faculty not found');
    }
    const response = await apiClient.put(`/faculty/${id}`, updatedData);
    return response.data;
  },

  deleteFaculty: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockFaculty = mockFaculty.filter((f) => f.id !== id);
      return { success: true };
    }
    await apiClient.delete(`/faculty/${id}`);
    return { success: true };
  },
};