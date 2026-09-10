// src/services/auditService.js

let mockAuditLogs = [
  { id: 1, userId: 1, action: 'LOGIN_SUCCESS', ipAddress: '192.168.1.10', details: 'User logged in successfully', timestamp: '2026-09-10T08:30:00Z' },
  { id: 2, userId: 1, action: 'CREATE_STUDENT', ipAddress: '192.168.1.10', details: 'Created student STU005 - Sarah Khan', timestamp: '2026-09-10T09:15:00Z' },
  { id: 3, userId: 2, action: 'UPDATE_GRADE', ipAddress: '192.168.1.25', details: 'Updated grade for student STU001 in CS101 from 85 to 90', timestamp: '2026-09-10T10:00:00Z' },
  { id: 4, userId: 3, action: 'DELETE_COURSE', ipAddress: '192.168.1.30', details: 'Deleted course BIO999 - Advanced Genetics', timestamp: '2026-09-10T11:30:00Z' },
  { id: 5, userId: 1, action: 'CREATE_INVOICE', ipAddress: '192.168.1.10', details: 'Generated invoice INV-2026-005 for STU002 ($1,200)', timestamp: '2026-09-10T14:20:00Z' },
  { id: 6, userId: 4, action: 'LOGIN_FAILED', ipAddress: '203.0.113.45', details: 'Failed login attempt for user@example.com', timestamp: '2026-09-10T15:45:00Z' },
  { id: 7, userId: 2, action: 'PUBLISH_ANNOUNCEMENT', ipAddress: '192.168.1.25', details: 'Published announcement "Midterm Schedule" for FACULTY', timestamp: '2026-09-11T08:00:00Z' },
  { id: 8, userId: 1, action: 'ROLE_CHANGE', ipAddress: '192.168.1.10', details: 'Changed role for user ID 5 from STUDENT to FACULTY', timestamp: '2026-09-11T09:30:00Z' },
  { id: 9, userId: 3, action: 'DELETE_INVOICE', ipAddress: '192.168.1.30', details: 'Deleted invoice INV-2026-001', timestamp: '2026-09-11T10:15:00Z' },
  { id: 10, userId: 1, action: 'SYSTEM_BACKUP', ipAddress: '192.168.1.10', details: 'Manual database backup initiated', timestamp: '2026-09-11T11:00:00Z' },
];

const mockUsers = [
  { id: 1, email: 'admin@university.edu', firstName: 'Admin', lastName: 'User' },
  { id: 2, email: 'faculty@university.edu', firstName: 'Robert', lastName: 'Smith' },
  { id: 3, email: 'registrar@university.edu', firstName: 'Maria', lastName: 'Garcia' },
  { id: 4, email: 'unknown@example.com', firstName: 'Unknown', lastName: 'User' },
];

export const auditService = {
  getAuditLogs: async () => {
    await new Promise(r => setTimeout(r, 500));
    return mockAuditLogs;
  },
  getUsers: async () => mockUsers,
};