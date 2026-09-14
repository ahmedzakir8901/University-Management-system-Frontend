// src/services/courseService.js

const USE_MOCK_DATA = true;

// ============ MOCK DATA ============
export const mockDepartments = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Mathematics', code: 'MATH' },
  { id: 3, name: 'Physics', code: 'PHY' },
  { id: 4, name: 'Chemistry', code: 'CHEM' },
  { id: 5, name: 'Biology', code: 'BIO' },
];

let mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Programming', description: 'Basics of Python and Java.', departmentId: 1, credits: 3, lectureHours: 3, labHours: 1, isElective: false },
  { id: 2, code: 'MATH201', title: 'Linear Algebra', description: 'Vectors, matrices, and transformations.', departmentId: 2, credits: 4, lectureHours: 3, labHours: 0, isElective: false },
  { id: 3, code: 'PHY101', title: 'Physics I', description: 'Mechanics and thermodynamics.', departmentId: 3, credits: 4, lectureHours: 3, labHours: 2, isElective: false },
  { id: 4, code: 'CS305', title: 'Artificial Intelligence', description: 'Machine learning fundamentals.', departmentId: 1, credits: 3, lectureHours: 2, labHours: 2, isElective: true },
  { id: 5, code: 'BIO210', title: 'Genetics', description: 'Heredity and DNA.', departmentId: 5, credits: 3, lectureHours: 3, labHours: 1, isElective: true },
];

// Prerequisites — matches your course_prerequisites table
// Structure: { courseId (the course), prerequisiteCourseId (the required course), minGrade }
let mockPrerequisites = [
  { courseId: 2, prerequisiteCourseId: 1, minGrade: 'C' },  // MATH201 requires CS101 with grade C
  { courseId: 4, prerequisiteCourseId: 1, minGrade: 'B' },  // CS305 requires CS101 with grade B
  { courseId: 4, prerequisiteCourseId: 2, minGrade: 'C' },  // CS305 also requires MATH201 with grade C
  { courseId: 5, prerequisiteCourseId: 3, minGrade: 'D' },  // BIO210 requires PHY101 with grade D
];

// ============ SERVICE ============
export const courseService = {
  // -------- Courses --------
  getAllCourses: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      return mockCourses;
    }
    // const response = await apiClient.get('/courses');
    // return response.data;
  },

  getAllDepartments: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 200));
      return mockDepartments;
    }
    // const response = await apiClient.get('/departments');
    // return response.data;
  },

  createCourse: async (courseData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const newCourse = { id: Date.now(), ...courseData };
      mockCourses.push(newCourse);
      return newCourse;
    }
    // const response = await apiClient.post('/courses', courseData);
    // return response.data;
  },

  updateCourse: async (id, updatedData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const idx = mockCourses.findIndex(c => c.id === id);
      if (idx !== -1) {
        mockCourses[idx] = { ...mockCourses[idx], ...updatedData };
        return mockCourses[idx];
      }
      throw new Error('Course not found');
    }
    // const response = await apiClient.put(`/courses/${id}`, updatedData);
    // return response.data;
  },

  deleteCourse: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockCourses = mockCourses.filter(c => c.id !== id);
      // Also remove any prerequisites referencing this course
      mockPrerequisites = mockPrerequisites.filter(
        p => p.courseId !== id && p.prerequisiteCourseId !== id
      );
      return { success: true };
    }
    // await apiClient.delete(`/courses/${id}`);
    // return { success: true };
  },

  // -------- Prerequisites --------
  // Get all prerequisites (used for stats / global view)
  getAllPrerequisites: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockPrerequisites;
    }
    // const response = await apiClient.get('/course-prerequisites');
    // return response.data;
  },

  // Get prerequisites for a specific course
  getPrerequisitesByCourse: async (courseId) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockPrerequisites.filter(p => p.courseId === courseId);
    }
    // const response = await apiClient.get(`/courses/${courseId}/prerequisites`);
    // return response.data;
  },

  // Add a prerequisite to a course
  createPrerequisite: async ({ courseId, prerequisiteCourseId, minGrade }) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));

      // Validation 1: Course can't be its own prerequisite
      if (courseId === prerequisiteCourseId) {
        throw new Error('A course cannot be a prerequisite for itself');
      }

      // Validation 2: Duplicate check
      const exists = mockPrerequisites.some(
        p => p.courseId === courseId && p.prerequisiteCourseId === prerequisiteCourseId
      );
      if (exists) {
        throw new Error('This prerequisite already exists for this course');
      }

      const newPrereq = { courseId, prerequisiteCourseId, minGrade };
      mockPrerequisites.push(newPrereq);
      return newPrereq;
    }
    // const response = await apiClient.post('/course-prerequisites', {
    //   courseId, prerequisiteCourseId, minGrade
    // });
    // return response.data;
  },

  // Delete a prerequisite
  deletePrerequisite: async (courseId, prerequisiteCourseId) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockPrerequisites = mockPrerequisites.filter(
        p => !(p.courseId === courseId && p.prerequisiteCourseId === prerequisiteCourseId)
      );
      return { success: true };
    }
    // await apiClient.delete(`/course-prerequisites/${courseId}/${prerequisiteCourseId}`);
    // return { success: true };
  },
};