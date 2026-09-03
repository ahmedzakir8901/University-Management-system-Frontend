// src/services/courseService.js

// Mock departments (based on your "departments" table)
export const mockDepartments = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Mathematics', code: 'MATH' },
  { id: 3, name: 'Physics', code: 'PHY' },
  { id: 4, name: 'Chemistry', code: 'CHEM' },
  { id: 5, name: 'Biology', code: 'BIO' },
];

// Mock courses (based on your "courses" table)
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Programming', description: 'Basics of Python and Java.', departmentId: 1, credits: 3, lectureHours: 3, labHours: 1, isElective: false },
  { id: 2, code: 'MATH201', title: 'Linear Algebra', description: 'Vectors, matrices, and transformations.', departmentId: 2, credits: 4, lectureHours: 3, labHours: 0, isElective: false },
  { id: 3, code: 'PHY101', title: 'Physics I', description: 'Mechanics and thermodynamics.', departmentId: 3, credits: 4, lectureHours: 3, labHours: 2, isElective: false },
  { id: 4, code: 'CS305', title: 'Artificial Intelligence', description: 'Machine learning fundamentals.', departmentId: 1, credits: 3, lectureHours: 2, labHours: 2, isElective: true },
  { id: 5, code: 'BIO210', title: 'Genetics', description: 'Heredity and DNA.', departmentId: 5, credits: 3, lectureHours: 3, labHours: 1, isElective: true },
];

export const courseService = {
  getAllCourses: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockCourses;
  },

  // We will need this for the form dropdown!
  getAllDepartments: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockDepartments;
  },

  createCourse: async (courseData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newCourse = { id: Date.now(), ...courseData };
    mockCourses.push(newCourse);
    return newCourse;
  },

  updateCourse: async (id, updatedData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockCourses.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCourses[index] = { ...mockCourses[index], ...updatedData };
      return mockCourses[index];
    }
    throw new Error('Course not found');
  },

  deleteCourse: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockCourses.findIndex((c) => c.id === id);
    if (index !== -1) mockCourses.splice(index, 1);
    return { success: true };
  },
};