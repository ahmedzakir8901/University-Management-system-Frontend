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

// ============ RICH MOCK DETAILS (for the Student Details Modal) ============
const mockDetails = {
  1: {
    emergencyContacts: [
      { id: 1, contactName: 'Mary Doe', relationship: 'Mother', phoneNumber: '555-1234', address: '123 Main St' },
      { id: 2, contactName: 'Robert Doe', relationship: 'Father', phoneNumber: '555-5678', address: '123 Main St' },
    ],
    enrolledCourses: [
      { id: 101, code: 'CS101', title: 'Introduction to Programming', credits: 3 },
      { id: 102, code: 'MATH101', title: 'Calculus I', credits: 4 },
      { id: 103, code: 'PHY101', title: 'Physics I', credits: 3 },
    ],
    attendanceSummary: [
      { id: 1, courseCode: 'CS101', attended: 18, total: 20, percentage: 90 },
      { id: 2, courseCode: 'MATH101', attended: 15, total: 20, percentage: 75 },
      { id: 3, courseCode: 'PHY101', attended: 19, total: 20, percentage: 95 },
    ],
    timetable: [
      { id: 1, day: 'MONDAY', startTime: '09:00', endTime: '10:30', courseCode: 'CS101', room: '101' },
      { id: 2, day: 'MONDAY', startTime: '11:00', endTime: '12:30', courseCode: 'MATH101', room: '205' },
      { id: 3, day: 'WEDNESDAY', startTime: '09:00', endTime: '10:30', courseCode: 'CS101', room: '101' },
      { id: 4, day: 'THURSDAY', startTime: '14:00', endTime: '16:00', courseCode: 'PHY101', room: 'LAB-A' },
    ],
    grades: [
      { id: 1, courseCode: 'CS101', itemType: 'MIDTERM', marksObtained: 85, maxMarks: 100, weightage: 20 },
      { id: 2, courseCode: 'CS101', itemType: 'FINAL_EXAM', marksObtained: 90, maxMarks: 100, weightage: 40 },
      { id: 3, courseCode: 'MATH101', itemType: 'ASSIGNMENT', marksObtained: 78, maxMarks: 100, weightage: 15 },
    ],
    finalGrades: [
      { id: 1, courseCode: 'CS101', letterGrade: 'A', gradePoint: 4.0, isPublished: true },
      { id: 2, courseCode: 'MATH101', letterGrade: 'B+', gradePoint: 3.5, isPublished: true },
      { id: 3, courseCode: 'PHY101', letterGrade: 'A-', gradePoint: 3.7, isPublished: false },
    ],
    // NEW: Semester-wise academic history (Transcript data)
    semesterGrades: [
      {
        semester: 1,
        termName: 'Fall 2024',
        termCode: 'FALL24',
        courses: [
          { code: 'CS101', title: 'Introduction to Programming', credits: 3, letterGrade: 'A', gradePoint: 4.0 },
          { code: 'MATH101', title: 'Calculus I', credits: 4, letterGrade: 'B+', gradePoint: 3.5 },
          { code: 'ENG101', title: 'English Composition', credits: 3, letterGrade: 'A-', gradePoint: 3.7 },
        ],
      },
      {
        semester: 2,
        termName: 'Spring 2025',
        termCode: 'SPRING25',
        courses: [
          { code: 'CS102', title: 'Object Oriented Programming', credits: 4, letterGrade: 'A', gradePoint: 4.0 },
          { code: 'MATH102', title: 'Calculus II', credits: 4, letterGrade: 'B', gradePoint: 3.0 },
          { code: 'PHY101', title: 'Physics I', credits: 3, letterGrade: 'A', gradePoint: 4.0 },
        ],
      },
      {
        semester: 3,
        termName: 'Fall 2025',
        termCode: 'FALL25',
        courses: [
          { code: 'CS201', title: 'Data Structures', credits: 4, letterGrade: 'A-', gradePoint: 3.7 },
          { code: 'MATH201', title: 'Linear Algebra', credits: 3, letterGrade: 'B+', gradePoint: 3.5 },
        ],
      },
    ],
    feeStatus: {
      totalBilled: 4500,
      totalPaid: 3000,
      balance: 1500,
      invoices: [
        { id: 1, invoiceNumber: 'INV-2026-001', amount: 1500, status: 'PAID', dueDate: '2026-09-15' },
        { id: 2, invoiceNumber: 'INV-2026-002', amount: 1500, status: 'PAID', dueDate: '2026-10-15' },
        { id: 3, invoiceNumber: 'INV-2026-003', amount: 1500, status: 'UNPAID', dueDate: '2026-11-15' },
      ],
    },
  },
  2: {
    emergencyContacts: [
      { id: 1, contactName: 'Robert Smith', relationship: 'Father', phoneNumber: '555-5678', address: '456 Oak Ave' },
    ],
    enrolledCourses: [
      { id: 103, code: 'MATH201', title: 'Linear Algebra', credits: 3 },
      { id: 104, code: 'CS201', title: 'Data Structures', credits: 4 },
    ],
    attendanceSummary: [
      { id: 1, courseCode: 'MATH201', attended: 19, total: 20, percentage: 95 },
      { id: 2, courseCode: 'CS201', attended: 14, total: 20, percentage: 70 },
    ],
    timetable: [
      { id: 1, day: 'TUESDAY', startTime: '10:00', endTime: '11:30', courseCode: 'MATH201', room: '205' },
      { id: 2, day: 'THURSDAY', startTime: '09:00', endTime: '10:30', courseCode: 'CS201', room: 'LAB-B' },
    ],
    grades: [
      { id: 1, courseCode: 'MATH201', itemType: 'ASSIGNMENT', marksObtained: 95, maxMarks: 100, weightage: 30 },
    ],
    finalGrades: [
      { id: 1, courseCode: 'MATH201', letterGrade: 'A', gradePoint: 4.0, isPublished: true },
    ],
    semesterGrades: [
      {
        semester: 1,
        termName: 'Spring 2025',
        termCode: 'SPRING25',
        courses: [
          { code: 'CS101', title: 'Introduction to Programming', credits: 3, letterGrade: 'A', gradePoint: 4.0 },
          { code: 'MATH101', title: 'Calculus I', credits: 4, letterGrade: 'A', gradePoint: 4.0 },
          { code: 'BIO101', title: 'General Biology', credits: 3, letterGrade: 'B+', gradePoint: 3.5 },
        ],
      },
      {
        semester: 2,
        termName: 'Fall 2025',
        termCode: 'FALL25',
        courses: [
          { code: 'MATH201', title: 'Linear Algebra', credits: 3, letterGrade: 'A', gradePoint: 4.0 },
          { code: 'CS201', title: 'Data Structures', credits: 4, letterGrade: 'A-', gradePoint: 3.7 },
          { code: 'STA201', title: 'Statistics', credits: 3, letterGrade: 'A', gradePoint: 4.0 },
        ],
      },
    ],
    feeStatus: {
      totalBilled: 3000,
      totalPaid: 3000,
      balance: 0,
      invoices: [
        { id: 1, invoiceNumber: 'INV-2026-004', amount: 1500, status: 'PAID', dueDate: '2026-09-15' },
        { id: 2, invoiceNumber: 'INV-2026-005', amount: 1500, status: 'PAID', dueDate: '2026-10-15' },
      ],
    },
  },
  3: {
    emergencyContacts: [],
    enrolledCourses: [],
    attendanceSummary: [],
    timetable: [],
    grades: [],
    finalGrades: [],
    semesterGrades: [],
    feeStatus: { totalBilled: 0, totalPaid: 0, balance: 0, invoices: [] },
  },
  4: {
    emergencyContacts: [
      { id: 5, contactName: 'Karen Johnson', relationship: 'Mother', phoneNumber: '555-9012', address: '789 Pine Rd' },
    ],
    enrolledCourses: [
      { id: 104, code: 'PHY101', title: 'Physics I', credits: 4 },
      { id: 105, code: 'CHEM101', title: 'General Chemistry', credits: 3 },
    ],
    attendanceSummary: [
      { id: 1, courseCode: 'PHY101', attended: 17, total: 20, percentage: 85 },
      { id: 2, courseCode: 'CHEM101', attended: 20, total: 20, percentage: 100 },
    ],
    timetable: [
      { id: 1, day: 'MONDAY', startTime: '14:00', endTime: '16:00', courseCode: 'PHY101', room: 'LAB-A' },
      { id: 2, day: 'FRIDAY', startTime: '11:00', endTime: '12:30', courseCode: 'CHEM101', room: '310' },
    ],
    grades: [
      { id: 1, courseCode: 'PHY101', itemType: 'QUIZ', marksObtained: 78, maxMarks: 100, weightage: 10 },
      { id: 2, courseCode: 'CHEM101', itemType: 'MIDTERM', marksObtained: 88, maxMarks: 100, weightage: 25 },
    ],
    finalGrades: [
      { id: 1, courseCode: 'PHY101', letterGrade: 'B', gradePoint: 3.0, isPublished: true },
      { id: 2, courseCode: 'CHEM101', letterGrade: 'A-', gradePoint: 3.7, isPublished: false },
    ],
    semesterGrades: [
      {
        semester: 1,
        termName: 'Fall 2025',
        termCode: 'FALL25',
        courses: [
          { code: 'PHY101', title: 'Physics I', credits: 4, letterGrade: 'B', gradePoint: 3.0 },
          { code: 'CHEM101', title: 'General Chemistry', credits: 3, letterGrade: 'A-', gradePoint: 3.7 },
        ],
      },
    ],
    feeStatus: {
      totalBilled: 3500,
      totalPaid: 1750,
      balance: 1750,
      invoices: [
        { id: 1, invoiceNumber: 'INV-2026-006', amount: 1750, status: 'PAID', dueDate: '2026-09-15' },
        { id: 2, invoiceNumber: 'INV-2026-007', amount: 1750, status: 'PARTIALLY_PAID', dueDate: '2026-11-15' },
      ],
    },
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
      // Merge basic info with rich details
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