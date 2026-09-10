// src/services/infrastructureService.js

let mockBuildings = [
  { id: 1, campusId: 1, name: 'Main Academic Block', code: 'MAB' },
  { id: 2, campusId: 1, name: 'Science Block', code: 'SB' },
  { id: 3, campusId: 2, name: 'North Library Building', code: 'NLB' },
];

let mockRooms = [
  { id: 1, buildingId: 1, roomNumber: '101', capacity: 60, roomType: 'LECTURE_HALL' },
  { id: 2, buildingId: 1, roomNumber: '102', capacity: 40, roomType: 'SEMINAR_ROOM' },
  { id: 3, buildingId: 2, roomNumber: 'LAB-A', capacity: 30, roomType: 'LAB' },
  { id: 4, buildingId: 3, roomNumber: 'AUD-1', capacity: 200, roomType: 'AUDITORIUM' },
];

export const infrastructureService = {
  // === Buildings ===
  getBuildings: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockBuildings;
  },
  createBuilding: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newBuilding = { id: Date.now(), ...data };
    mockBuildings.push(newBuilding);
    return newBuilding;
  },
  updateBuilding: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockBuildings.findIndex(b => b.id === id);
    if (idx !== -1) mockBuildings[idx] = { ...mockBuildings[idx], ...data };
    return mockBuildings[idx];
  },
  deleteBuilding: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockBuildings = mockBuildings.filter(b => b.id !== id);
    return { success: true };
  },

  // === Rooms ===
  getRooms: async () => {
    await new Promise(r => setTimeout(r, 400));
    return mockRooms;
  },
  createRoom: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const newRoom = { id: Date.now(), ...data };
    mockRooms.push(newRoom);
    return newRoom;
  },
  updateRoom: async (id, data) => {
    await new Promise(r => setTimeout(r, 400));
    const idx = mockRooms.findIndex(r => r.id === id);
    if (idx !== -1) mockRooms[idx] = { ...mockRooms[idx], ...data };
    return mockRooms[idx];
  },
  deleteRoom: async (id) => {
    await new Promise(r => setTimeout(r, 400));
    mockRooms = mockRooms.filter(r => r.id !== id);
    return { success: true };
  },

  // Helper: Get campuses for dropdowns
  getCampuses: async () => {
    await new Promise(r => setTimeout(r, 200));
    return [
      { id: 1, name: 'Main Campus', code: 'MC' },
      { id: 2, name: 'North Campus', code: 'NC' },
    ];
  },
};