import { apiCall } from './api.js';

export const initData = async () => {
  // No-op for API version, or health check
};

export const getRoom = async (roomId) => {
  try {
    const rooms = await getAllRooms();
    return rooms.find(r => r.id === roomId);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getStudentRoom = async (studentId) => {
  const rooms = await getAllRooms();
  // Backend return rooms with Users. Search through them.
  return rooms.find(r => (r.Users || []).some(u => u.id === studentId));
};

export const assignRoom = async (studentId, roomId) => {
  try {
    await apiCall('/api/rooms/assign', 'POST', { studentId, roomId });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const autoAssignDemo = async (studentId) => {
  if (studentId === 'admin') return;
  try {
    const existingRoom = await getStudentRoom(studentId);
    if (existingRoom) return;

    const rooms = await getAllRooms();
    const availableRoom = rooms.find(r => (r.Users || []).length < r.capacity);

    if (availableRoom) {
      await assignRoom(studentId, availableRoom.id);
    }
  } catch (e) {
    console.error('Auto assign failed', e);
  }
};

export const getRequests = async (studentId = null) => {
  let url = '/api/requests';
  if (studentId) {
    url += `?studentId=${studentId}`;
  }
  return await apiCall(url);
};

export const createRequest = async (studentId, category, description) => {
  return await apiCall('/api/requests', 'POST', { studentId, category, description });
};

export const updateRequestStatus = async (requestId, status) => {
  try {
    await apiCall(`/api/requests/${requestId}`, 'PATCH', { status });
    return true;
  } catch (e) {
    return false;
  }
};

export const getAllRooms = async () => {
  const rooms = await apiCall('/api/rooms');
  return rooms.map(r => ({
    ...r,
    occupants: r.Users || []
  }));
};

export const getAllStudents = async () => {
  return await apiCall('/api/students');
};

export const getUserById = async (id) => {
  const students = await getAllStudents();
  return students.find(s => s.id === id);
};
