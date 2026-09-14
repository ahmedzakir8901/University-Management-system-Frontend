// src/services/settingsService.js

const USE_MOCK_DATA = true;

// ============ MOCK DATA: Academic Structure ============
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

// ============ MOCK DATA: Roles ============
const mockRoles = [
  { id: 1, name: 'ADMIN', description: 'System administrator' },
  { id: 2, name: 'FACULTY', description: 'Teaching staff' },
  { id: 3, name: 'STUDENT', description: 'Enrolled students' },
  { id: 4, name: 'LIBRARIAN', description: 'Library staff' },
];

// ============ MOCK DATA: Permissions ============
let mockPermissions = [
  { id: 1, name: 'STUDENT_CREATE', description: 'Create new students' },
  { id: 2, name: 'STUDENT_EDIT', description: 'Edit student records' },
  { id: 3, name: 'STUDENT_DELETE', description: 'Delete student records' },
  { id: 4, name: 'COURSE_CREATE', description: 'Create new courses' },
  { id: 5, name: 'COURSE_EDIT', description: 'Edit course details' },
  { id: 6, name: 'COURSE_DELETE', description: 'Delete courses' },
  { id: 7, name: 'GRADE_INPUT', description: 'Enter student grades' },
  { id: 8, name: 'GRADE_PUBLISH', description: 'Publish final grades' },
  { id: 9, name: 'FEE_COLLECT', description: 'Process fee payments' },
  { id: 10, name: 'FEE_STRUCTURE_MANAGE', description: 'Manage fee structures' },
  { id: 11, name: 'LIBRARY_ISSUE', description: 'Issue library books' },
  { id: 12, name: 'AUDIT_VIEW', description: 'View audit logs' },
];

// ============ MOCK DATA: Role Permissions (junction table) ============
let mockRolePermissions = [
  // ADMIN: all permissions
  { roleId: 1, permissionId: 1 }, { roleId: 1, permissionId: 2 }, { roleId: 1, permissionId: 3 },
  { roleId: 1, permissionId: 4 }, { roleId: 1, permissionId: 5 }, { roleId: 1, permissionId: 6 },
  { roleId: 1, permissionId: 7 }, { roleId: 1, permissionId: 8 }, { roleId: 1, permissionId: 9 },
  { roleId: 1, permissionId: 10 }, { roleId: 1, permissionId: 11 }, { roleId: 1, permissionId: 12 },

  // FACULTY: create/edit students, courses, grades
  { roleId: 2, permissionId: 1 }, { roleId: 2, permissionId: 2 },
  { roleId: 2, permissionId: 4 }, { roleId: 2, permissionId: 5 },
  { roleId: 2, permissionId: 7 }, { roleId: 2, permissionId: 8 },
  { roleId: 2, permissionId: 11 },

  // STUDENT: no admin permissions (view-only enforced by backend)

  // LIBRARIAN: library + basic
  { roleId: 4, permissionId: 11 },
];

// ============ SERVICE ============
export const settingsService = {
  // ============================================================
  // CAMPUSES
  // ============================================================
  getCampuses: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockCampuses;
    }
    // const response = await apiClient.get('/campuses');
    // return response.data;
  },
  createCampus: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const newCampus = { id: Date.now(), ...data };
      mockCampuses.push(newCampus);
      return newCampus;
    }
  },
  updateCampus: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockCampuses.findIndex(c => c.id === id);
      if (idx !== -1) mockCampuses[idx] = { ...mockCampuses[idx], ...data };
      return mockCampuses[idx];
    }
  },
  deleteCampus: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockCampuses = mockCampuses.filter(c => c.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // DEPARTMENTS
  // ============================================================
  getDepartments: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockDepartments;
    }
  },
  createDepartment: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const newDept = { id: Date.now(), ...data };
      mockDepartments.push(newDept);
      return newDept;
    }
  },
  updateDepartment: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockDepartments.findIndex(d => d.id === id);
      if (idx !== -1) mockDepartments[idx] = { ...mockDepartments[idx], ...data };
      return mockDepartments[idx];
    }
  },
  deleteDepartment: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockDepartments = mockDepartments.filter(d => d.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // ACADEMIC TERMS
  // ============================================================
  getTerms: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      return mockTerms;
    }
  },
  createTerm: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const newTerm = { id: Date.now(), ...data };
      mockTerms.push(newTerm);
      return newTerm;
    }
  },
  updateTerm: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockTerms.findIndex(t => t.id === id);
      if (idx !== -1) mockTerms[idx] = { ...mockTerms[idx], ...data };
      return mockTerms[idx];
    }
  },
  deleteTerm: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockTerms = mockTerms.filter(t => t.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // PERMISSIONS  ← NEW
  // ============================================================
  getPermissions: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 300));
      return mockPermissions;
    }
    // const response = await apiClient.get('/permissions');
    // return response.data;
  },

  createPermission: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));

      if (mockPermissions.some(p => p.name === data.name)) {
        throw new Error('A permission with this name already exists');
      }

      const newPerm = { id: Date.now(), ...data };
      mockPermissions.push(newPerm);
      return newPerm;
    }
  },

  updatePermission: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      const idx = mockPermissions.findIndex(p => p.id === id);
      if (idx !== -1) mockPermissions[idx] = { ...mockPermissions[idx], ...data };
      return mockPermissions[idx];
    }
  },

  deletePermission: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 400));
      mockPermissions = mockPermissions.filter(p => p.id !== id);
      // Also remove from role_permissions
      mockRolePermissions = mockRolePermissions.filter(rp => rp.permissionId !== id);
      return { success: true };
    }
  },

  // ============================================================
  // ROLE PERMISSIONS  ← NEW
  // ============================================================
  getRoles: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 200));
      return mockRoles;
    }
  },

  getRolePermissions: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 300));
      return mockRolePermissions;
    }
  },

  // Grant a permission to a role
  grantPermission: async (roleId, permissionId) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 300));

      const exists = mockRolePermissions.some(
        rp => rp.roleId === roleId && rp.permissionId === permissionId
      );
      if (exists) return { success: true };

      mockRolePermissions.push({ roleId, permissionId });
      return { success: true };
    }
  },

  // Revoke a permission from a role
  revokePermission: async (roleId, permissionId) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 300));

      mockRolePermissions = mockRolePermissions.filter(
        rp => !(rp.roleId === roleId && rp.permissionId === permissionId)
      );
      return { success: true };
    }
  },
};