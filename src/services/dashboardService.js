// src/services/dashboardService.js

// Mock data based on your university database
const mockDashboardData = {
  stats: {
    totalStudents: 1250,
    totalFaculty: 85,
    totalCourses: 42,
    totalDepartments: 5,
    attendanceRate: 92.5,
    feeCollectionRate: 87.3,
  },
  studentDistribution: [
    { name: 'Computer Science', students: 350, fill: '#8884d8' },
    { name: 'Mathematics', students: 280, fill: '#83a6ed' },
    { name: 'Physics', students: 220, fill: '#8dd1e1' },
    { name: 'Chemistry', students: 180, fill: '#82ca9d' },
    { name: 'Biology', students: 150, fill: '#ffc658' },
    { name: 'English', students: 70, fill: '#ff8042' },
  ],
  enrollmentTrend: [
    { month: 'Jan', enrollments: 120 },
    { month: 'Feb', enrollments: 150 },
    { month: 'Mar', enrollments: 180 },
    { month: 'Apr', enrollments: 160 },
    { month: 'May', enrollments: 200 },
    { month: 'Jun', enrollments: 220 },
    { month: 'Jul', enrollments: 190 },
    { month: 'Aug', enrollments: 240 },
    { month: 'Sep', enrollments: 260 },
    { month: 'Oct', enrollments: 210 },
    { month: 'Nov', enrollments: 230 },
    { month: 'Dec', enrollments: 250 },
  ],
  recentActivities: [
    { id: 1, action: 'New student enrolled', user: 'John Doe', timestamp: '2026-09-01T10:30:00Z' },
    { id: 2, action: 'Course grade updated', user: 'Prof. Smith', timestamp: '2026-09-01T09:15:00Z' },
    { id: 3, action: 'Fee payment received', user: 'Jane Smith', timestamp: '2026-08-31T14:45:00Z' },
    { id: 4, action: 'New course added', user: 'Admin', timestamp: '2026-08-31T11:20:00Z' },
    { id: 5, action: 'Attendance marked', user: 'Prof. Johnson', timestamp: '2026-08-30T16:00:00Z' },
  ],
};

export const dashboardService = {
  getDashboardData: async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockDashboardData;
  },
};