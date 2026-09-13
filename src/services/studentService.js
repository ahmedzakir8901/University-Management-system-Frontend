// src/services/studentService.js
import apiClient from '../api/apiClient';

// ================================================================
// 🔑 THE TOGGLE: Change this to `false` when the backend is ready!
// ================================================================
const USE_MOCK_DATA = true;

// ============ MOCK DATA (used while USE_MOCK_DATA = true) ============
let mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe', email: 'john@university.edu', departmentId: 1, currentSemester: 3, cgpa: 3.5, academicStatus: 'ACTIVE' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith', email: 'jane@university.edu', departmentId: 2, currentSemester: 2, cgpa: 3.8, academicStatus: 'ACTIVE' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown', email: 'bob@university.edu', departmentId: 3, currentSemester: 5, cgpa: 2.9, academicStatus: 'PROBATION' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson', email: 'alice@university.edu', departmentId: 1, currentSemester: 1, cgpa: 3.9, academicStatus: 'ACTIVE' },
];

const mockDetails = {
  1: {
    emergencyContacts: [
      { id: 1, contactName: 'Mary Doe', relationship: 'Mother', phoneNumber: '555-1234', address: '123 Main St' },
    ],
    enrolledCourses: [
      { id: 101, code: 'CS101', title: 'Introduction to Programming', credits: 3 },
      { id: 102, code: 'MATH101', title: 'Calculus I', credits: 4 },
    ],
    grades: [
      { id: 1, courseCode: 'CS101', itemType: 'Midterm', marksObtained: 85, maxMarks: 100, weightage: 20 },
      { id: 2, courseCode: 'CS101', itemType: 'Final', marksObtained: 90, maxMarks: 100, weightage: 40 },
    ],
  },
  2: {
    emergencyContacts: [
      { id: 1, contactName: 'Robert Smith', relationship: 'Father', phoneNumber: '555-5678', address: '456 Oak Ave' },
    ],
    enrolledCourses: [{ id: 103, code: 'MATH201', title: 'Linear Algebra', credits: 3 }],
    grades: [{ id: 3, courseCode: 'MATH201', itemType: 'Assignment', marksObtained: 95, maxMarks: 100, weightage: 30 }],
  },
  3: { emergencyContacts: [], enrolledCourses: [], grades: [] },
  4: {
    emergencyContacts: [
      { id: 5, contactName: 'Karen Johnson', relationship: 'Mother', phoneNumber: '555-9012', address: '789 Pine Rd' },
    ],
    enrolledCourses: [{ id: 104, code: 'PHY101', title: 'Physics I', credits: 4 }],
    grades: [{ id: 4, courseCode: 'PHY101', itemType: 'Quiz', marksObtained: 78, maxMarks: 100, weightage: 10 }],
  },
};

// ============ SERVICE (works for both mock & real) ============
export const studentService = {
  getAllStudents: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      return mockStudents;
    }
    const response = await apiClient.get('/students');
    return response.data;
  },

  getStudentById: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const student = mockStudents.find(s => s.id === id);
      if (!student) throw new Error('Student not found');
      return { ...student, ...(mockDetails[id] || {}) };
    }
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const newStudent = {
        id: Date.now(),
        rollNumber: `STU${Math.floor(1000 + Math.random() * 9000)}`,
        academicStatus: 'ACTIVE',
        ...studentData,
      };
      mockStudents.push(newStudent);
      return newStudent;
    }
    const response = await apiClient.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const idx = mockStudents.findIndex(s => s.id === id);
      if (idx !== -1) mockStudents[idx] = { ...mockStudents[idx], ...studentData };
      return mockStudents[idx];
    }
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockStudents = mockStudents.filter(s => s.id !== id);
      return { success: true };
    }
    await apiClient.delete(`/students/${id}`);
    return { success: true };
  },
};