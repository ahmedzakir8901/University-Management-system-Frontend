// src/services/evaluationService.js

let mockEvaluations = [
  { id: 1, sectionId: 1, studentId: 1, ratingTeaching: 5, ratingCourseContent: 4, ratingOverall: 5, comments: 'Excellent teaching style!', submittedAt: '2026-12-20T10:00:00Z' },
  { id: 2, sectionId: 1, studentId: 2, ratingTeaching: 4, ratingCourseContent: 4, ratingOverall: 4, comments: 'Good course, would recommend.', submittedAt: '2026-12-20T11:30:00Z' },
  { id: 3, sectionId: 2, studentId: 4, ratingTeaching: 3, ratingCourseContent: 5, ratingOverall: 4, comments: 'Content was great but teaching pace was fast.', submittedAt: '2026-12-21T09:15:00Z' },
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

const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

export const evaluationService = {
  getEvaluations: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockEvaluations;
  },
  createEvaluation: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newEval = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      ...data,
    };
    mockEvaluations.push(newEval);
    return newEval;
  },
  updateEvaluation: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockEvaluations.findIndex(e => e.id === id);
    if (idx !== -1) mockEvaluations[idx] = { ...mockEvaluations[idx], ...data };
    return mockEvaluations[idx];
  },
  deleteEvaluation: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockEvaluations = mockEvaluations.filter(e => e.id !== id);
    return { success: true };
  },

  // Lookups
  getSections: async () => mockSections,
  getCourses: async () => mockCourses,
  getStudents: async () => mockStudents,
};