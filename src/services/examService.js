// src/services/examService.js

let mockExams = [
  { id: 1, termId: 1, courseId: 1, examType: 'MIDTERM', examDate: '2026-10-20', startTime: '09:00', endTime: '11:00', roomId: 1 },
  { id: 2, termId: 1, courseId: 2, examType: 'FINAL', examDate: '2026-12-15', startTime: '09:00', endTime: '12:00', roomId: 3 },
  { id: 3, termId: 1, courseId: 1, examType: 'FINAL', examDate: '2026-12-18', startTime: '14:00', endTime: '17:00', roomId: 4 },
];

let mockExamSeating = [
  { id: 1, examId: 1, studentId: 1, seatNumber: 'A-01', invigilatorFacultyId: 1 },
  { id: 2, examId: 1, studentId: 2, seatNumber: 'A-02', invigilatorFacultyId: 1 },
  { id: 3, examId: 1, studentId: 3, seatNumber: 'A-03', invigilatorFacultyId: 2 },
];

// Lookup helpers
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Intro to Programming' },
  { id: 2, code: 'MATH201', title: 'Linear Algebra' },
  { id: 3, code: 'PHY101', title: 'Physics I' },
];

const mockTerms = [
  { id: 1, name: 'Fall 2026', termCode: 'FALL26' },
  { id: 2, name: 'Spring 2027', termCode: 'SPRING27' },
];

const mockRooms = [
  { id: 1, roomNumber: '101', capacity: 60 },
  { id: 2, roomNumber: '102', capacity: 40 },
  { id: 3, roomNumber: 'LAB-A', capacity: 30 },
  { id: 4, roomNumber: 'AUD-1', capacity: 200 },
];

const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

const mockFaculty = [
  { id: 1, employeeId: 'FAC001', firstName: 'Robert', lastName: 'Smith' },
  { id: 2, employeeId: 'FAC002', firstName: 'Maria', lastName: 'Garcia' },
];

export const examService = {
  // Exams
  getExams: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockExams;
  },
  createExam: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newExam = { id: Date.now(), ...data };
    mockExams.push(newExam);
    return newExam;
  },
  updateExam: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockExams.findIndex(e => e.id === id);
    if (idx !== -1) mockExams[idx] = { ...mockExams[idx], ...data };
    return mockExams[idx];
  },
  deleteExam: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockExams = mockExams.filter(e => e.id !== id);
    return { success: true };
  },

  // Seating
  getExamSeating: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockExamSeating;
  },
  createExamSeat: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newSeat = { id: Date.now(), ...data };
    mockExamSeating.push(newSeat);
    return newSeat;
  },
  updateExamSeat: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockExamSeating.findIndex(s => s.id === id);
    if (idx !== -1) mockExamSeating[idx] = { ...mockExamSeating[idx], ...data };
    return mockExamSeating[idx];
  },
  deleteExamSeat: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockExamSeating = mockExamSeating.filter(s => s.id !== id);
    return { success: true };
  },

  // Lookups
  getCourses: async () => mockCourses,
  getTerms: async () => mockTerms,
  getRooms: async () => mockRooms,
  getStudents: async () => mockStudents,
  getFaculty: async () => mockFaculty,
};