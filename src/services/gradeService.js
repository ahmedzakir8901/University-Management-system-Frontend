// src/services/gradeService.js

const USE_MOCK_DATA = true;

// ============ MOCK DATA ============
let mockGradeItems = [
  { id: 1, sectionId: 1, title: 'Assignment 1', itemType: 'ASSIGNMENT', maxMarks: 100, weightagePercent: 10, dueDate: '2026-09-15T23:59:00' },
  { id: 2, sectionId: 1, title: 'Midterm Exam', itemType: 'MIDTERM', maxMarks: 100, weightagePercent: 30, dueDate: '2026-10-20T09:00:00' },
  { id: 3, sectionId: 1, title: 'Final Exam', itemType: 'FINAL_EXAM', maxMarks: 100, weightagePercent: 50, dueDate: '2026-12-15T09:00:00' },
  { id: 4, sectionId: 2, title: 'Quiz 1', itemType: 'QUIZ', maxMarks: 20, weightagePercent: 5, dueDate: '2026-09-10T10:00:00' },
];

let mockStudentGrades = [
  { id: 1, gradeItemId: 1, studentId: 1, marksObtained: 85, feedback: 'Good work!', gradedAt: '2026-09-16T10:00:00Z' },
  { id: 2, gradeItemId: 1, studentId: 2, marksObtained: 92, feedback: 'Excellent!', gradedAt: '2026-09-16T10:05:00Z' },
  { id: 3, gradeItemId: 2, studentId: 1, marksObtained: 78, feedback: '', gradedAt: '2026-10-21T14:00:00Z' },
  { id: 4, gradeItemId: 2, studentId: 2, marksObtained: 88, feedback: 'Well done', gradedAt: '2026-10-21T14:05:00Z' },
  { id: 5, gradeItemId: 3, studentId: 1, marksObtained: 82, feedback: '', gradedAt: '2026-12-16T09:00:00Z' },
  { id: 6, gradeItemId: 3, studentId: 2, marksObtained: 91, feedback: '', gradedAt: '2026-12-16T09:05:00Z' },
];

// NEW: Final grades — matches your final_course_grades table
let mockFinalGrades = [
  // Example: student 2 already has a published final grade for section 1
  { id: 1, enrollmentId: 2, totalScore: 90.2, letterGrade: 'A', gradePoint: 4.0, isPublished: true },
];

// Lookup data
const mockSections = [
  { id: 1, courseId: 1, termId: 1, sectionName: 'A' },
  { id: 2, courseId: 1, termId: 1, sectionName: 'B' },
];

const mockCourses = [
  { id: 1, code: 'CS101', title: 'Intro to Programming' },
];

const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
];

// Enrollments — students enrolled in sections
const mockEnrollments = [
  { id: 1, studentId: 1, sectionId: 1, enrollmentStatus: 'ENROLLED' },
  { id: 2, studentId: 2, sectionId: 1, enrollmentStatus: 'ENROLLED' },
  { id: 3, studentId: 3, sectionId: 1, enrollmentStatus: 'DROPPED' }, // excluded
  { id: 4, studentId: 3, sectionId: 2, enrollmentStatus: 'ENROLLED' },
];

// ============ SERVICE ============
export const gradeService = {
  // ============================================================
  // GRADE ITEMS
  // ============================================================
  getGradeItems: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockGradeItems;
    }
  },
  createGradeItem: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const newItem = { id: Date.now(), ...data };
      mockGradeItems.push(newItem);
      return newItem;
    }
  },
  updateGradeItem: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockGradeItems.findIndex(i => i.id === id);
      if (idx !== -1) mockGradeItems[idx] = { ...mockGradeItems[idx], ...data };
      return mockGradeItems[idx];
    }
  },
  deleteGradeItem: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockGradeItems = mockGradeItems.filter(i => i.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // STUDENT GRADES
  // ============================================================
  getStudentGrades: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockStudentGrades;
    }
  },
  createStudentGrade: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const newGrade = { id: Date.now(), gradedAt: new Date().toISOString(), ...data };
      mockStudentGrades.push(newGrade);
      return newGrade;
    }
  },
  updateStudentGrade: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockStudentGrades.findIndex(g => g.id === id);
      if (idx !== -1) mockStudentGrades[idx] = { ...mockStudentGrades[idx], ...data };
      return mockStudentGrades[idx];
    }
  },
  deleteStudentGrade: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockStudentGrades = mockStudentGrades.filter(g => g.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // FINAL GRADES  ← NEW
  // ============================================================
  getAllFinalGrades: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockFinalGrades;
    }
  },

  getFinalGradeByEnrollment: async (enrollmentId) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 300));
      return mockFinalGrades.find(fg => fg.enrollmentId === enrollmentId) || null;
    }
  },

  createFinalGrade: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const newFG = { id: Date.now(), isPublished: false, ...data };
      mockFinalGrades.push(newFG);
      return newFG;
    }
  },

  updateFinalGrade: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const idx = mockFinalGrades.findIndex(fg => fg.id === id);
      if (idx !== -1) mockFinalGrades[idx] = { ...mockFinalGrades[idx], ...data };
      return mockFinalGrades[idx];
    }
  },

  deleteFinalGrade: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockFinalGrades = mockFinalGrades.filter(fg => fg.id !== id);
      return { success: true };
    }
  },

  publishFinalGrade: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const idx = mockFinalGrades.findIndex(fg => fg.id === id);
      if (idx !== -1) mockFinalGrades[idx].isPublished = true;
      return mockFinalGrades[idx];
    }
  },

  unpublishFinalGrade: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const idx = mockFinalGrades.findIndex(fg => fg.id === id);
      if (idx !== -1) mockFinalGrades[idx].isPublished = false;
      return mockFinalGrades[idx];
    }
  },

  // ============================================================
  // LOOKUP DATA
  // ============================================================
  getSections: async () => mockSections,
  getCourses: async () => mockCourses,
  getStudents: async () => mockStudents,
  getEnrollments: async () => mockEnrollments,
};