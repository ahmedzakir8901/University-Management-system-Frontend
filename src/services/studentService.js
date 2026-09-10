import apiClient from '../api/apiClient'; // Import our new Axios instance

export const studentService = {
  getAllStudents: async () => {
    // This calls: GET http://localhost:8080/api/students
    const response = await apiClient.get('/students');
    return response.data;
  },

  getStudentById: async (id) => {
    // This calls: GET http://localhost:8080/api/students/5
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    // This calls: POST http://localhost:8080/api/students
    const response = await apiClient.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    // This calls: PUT http://localhost:8080/api/students/5
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    // This calls: DELETE http://localhost:8080/api/students/5
    await apiClient.delete(`/students/${id}`);
    return { success: true };
  },
};