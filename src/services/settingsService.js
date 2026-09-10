// src/services/settingsService.js

let mockCampuses = [
  { id: 1, name: 'Main Campus', code: 'MC', address: '123 University Ave, City', contactEmail: 'info@maincampus.edu' },
  { id: 2, name: 'North Campus', code: 'NC', address: '456 North Rd, City', contactEmail: 'info@northcampus.edu' },
];

let mockDepartments = [
  { id: 1, campusId: 1, name: 'Computer Science', code: 'CS', headOfDepartmentId: null },
  { id: 2, campusId: 1, name: 'Mathematics', code: 'MATH', headOfDepartmentId: null },
  { id: 3, campusId: 2, name: 'Physics', code: 'PHY', headOfDepartmentId: null },
];

let mockTerms = [
  { id: 1, name: 'Fall 2026', termCode: 'FALL26', startDate: '2026-09-01', endDate: '2026-12-20', isCurrent: true },
  { id: 2, name: 'Spring 2027', termCode: 'SPRING27', startDate: '2027-01-15', endDate: '2027-05-15', isCurrent: false },
];

export const settingsService = {
  // === Campuses ===
  getCampuses: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockCampuses;
  },
  createCampus: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newCampus = { id: Date.now(), ...data };
    mockCampuses.push(newCampus);
    return newCampus;
  },
  updateCampus: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockCampuses.findIndex(c => c.id === id);
    if (idx !== -1) mockCampuses[idx] = { ...mockCampuses[idx], ...data };
    return mockCampuses[idx];
  },
  deleteCampus: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockCampuses = mockCampuses.filter(c => c.id !== id);
    return { success: true };
  },

  // === Departments ===
  getDepartments: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockDepartments;
  },
  createDepartment: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newDept = { id: Date.now(), ...data };
    mockDepartments.push(newDept);
    return newDept;
  },
  updateDepartment: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockDepartments.findIndex(d => d.id === id);
    if (idx !== -1) mockDepartments[idx] = { ...mockDepartments[idx], ...data };
    return mockDepartments[idx];
  },
  deleteDepartment: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockDepartments = mockDepartments.filter(d => d.id !== id);
    return { success: true };
  },

  // === Academic Terms ===
  getTerms: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockTerms;
  },
  createTerm: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newTerm = { id: Date.now(), ...data };
    mockTerms.push(newTerm);
    return newTerm;
  },
  updateTerm: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockTerms.findIndex(t => t.id === id);
    if (idx !== -1) mockTerms[idx] = { ...mockTerms[idx], ...data };
    return mockTerms[idx];
  },
  deleteTerm: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockTerms = mockTerms.filter(t => t.id !== id);
    return { success: true };
  },
};