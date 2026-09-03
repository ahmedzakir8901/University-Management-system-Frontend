// src/services/facultyService.js

// Reusing the departments from your database
export const mockDepartments = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Mathematics', code: 'MATH' },
  { id: 3, name: 'Physics', code: 'PHY' },
  { id: 4, name: 'Chemistry', code: 'CHEM' },
  { id: 5, name: 'Biology', code: 'BIO' },
];

// Mock faculty data (matching your "faculty" table)
const mockFaculty = [
  { id: 1, employeeId: 'FAC001', firstName: 'Robert', lastName: 'Smith', email: 'robert.smith@university.edu', departmentId: 1, designation: 'Professor', joiningDate: '2015-08-15', officeRoom: 'CS-201', specialization: 'Artificial Intelligence' },
  { id: 2, employeeId: 'FAC002', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@university.edu', departmentId: 2, designation: 'Associate Professor', joiningDate: '2018-01-10', officeRoom: 'MATH-105', specialization: 'Algebra' },
  { id: 3, employeeId: 'FAC003', firstName: 'James', lastName: 'Brown', email: 'james.brown@university.edu', departmentId: 3, designation: 'Lecturer', joiningDate: '2021-09-01', officeRoom: 'PHY-310', specialization: 'Quantum Mechanics' },
];

export const facultyService = {
  getAllFaculty: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockFaculty;
  },

  getAllDepartments: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockDepartments;
  },

  createFaculty: async (facultyData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newFaculty = { id: Date.now(), ...facultyData };
    mockFaculty.push(newFaculty);
    return newFaculty;
  },

  updateFaculty: async (id, updatedData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockFaculty.findIndex((f) => f.id === id);
    if (index !== -1) {
      mockFaculty[index] = { ...mockFaculty[index], ...updatedData };
      return mockFaculty[index];
    }
    throw new Error('Faculty not found');
  },

  deleteFaculty: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockFaculty.findIndex((f) => f.id === id);
    if (index !== -1) mockFaculty.splice(index, 1);
    return { success: true };
  },
};