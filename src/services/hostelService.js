// src/services/hostelService.js

let mockHostels = [
  { id: 1, campusId: 1, name: 'Al-Biruni Hostel', type: 'MALE', wardenName: 'Mr. Ahmed Khan', contactNumber: '+92-300-1111111' },
  { id: 2, campusId: 1, name: 'Fatima Jinnah Hostel', type: 'FEMALE', wardenName: 'Mrs. Sana Malik', contactNumber: '+92-300-2222222' },
  { id: 3, campusId: 2, name: 'Iqbal Hostel', type: 'MALE', wardenName: 'Mr. Hassan Raza', contactNumber: '+92-300-3333333' },
];

let mockHostelRooms = [
  { id: 1, hostelId: 1, roomNumber: '101', capacity: 2, monthlyRent: 15000 },
  { id: 2, hostelId: 1, roomNumber: '102', capacity: 2, monthlyRent: 15000 },
  { id: 3, hostelId: 2, roomNumber: '201', capacity: 3, monthlyRent: 12000 },
  { id: 4, hostelId: 3, roomNumber: '301', capacity: 1, monthlyRent: 25000 },
];

let mockAllocations = [
  { id: 1, studentId: 1, hostelRoomId: 1, allocatedDate: '2026-09-01', vacatedDate: null },
  { id: 2, studentId: 2, hostelRoomId: 3, allocatedDate: '2026-09-01', vacatedDate: null },
];

// Lookups
const mockCampuses = [
  { id: 1, name: 'Main Campus', code: 'MC' },
  { id: 2, name: 'North Campus', code: 'NC' },
];

const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

export const hostelService = {
  // === Hostels ===
  getHostels: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockHostels;
  },
  createHostel: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newHostel = { id: Date.now(), ...data };
    mockHostels.push(newHostel);
    return newHostel;
  },
  updateHostel: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockHostels.findIndex(h => h.id === id);
    if (idx !== -1) mockHostels[idx] = { ...mockHostels[idx], ...data };
    return mockHostels[idx];
  },
  deleteHostel: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockHostels = mockHostels.filter(h => h.id !== id);
    return { success: true };
  },

  // === Hostel Rooms ===
  getHostelRooms: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockHostelRooms;
  },
  createHostelRoom: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newRoom = { id: Date.now(), ...data };
    mockHostelRooms.push(newRoom);
    return newRoom;
  },
  updateHostelRoom: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockHostelRooms.findIndex(r => r.id === id);
    if (idx !== -1) mockHostelRooms[idx] = { ...mockHostelRooms[idx], ...data };
    return mockHostelRooms[idx];
  },
  deleteHostelRoom: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockHostelRooms = mockHostelRooms.filter(r => r.id !== id);
    return { success: true };
  },

  // === Allocations ===
  getAllocations: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockAllocations;
  },
  createAllocation: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newAllocation = {
      id: Date.now(),
      allocatedDate: new Date().toISOString().split('T')[0],
      vacatedDate: null,
      ...data,
    };
    mockAllocations.push(newAllocation);
    return newAllocation;
  },
  // Vacate = soft delete (set vacated date instead of deleting)
  vacateAllocation: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockAllocations.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockAllocations[idx] = {
        ...mockAllocations[idx],
        vacatedDate: new Date().toISOString().split('T')[0],
      };
    }
    return mockAllocations[idx];
  },
  deleteAllocation: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockAllocations = mockAllocations.filter(a => a.id !== id);
    return { success: true };
  },

  // Lookups
  getCampuses: async () => mockCampuses,
  getStudents: async () => mockStudents,
};