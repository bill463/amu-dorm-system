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
  try {
    const students = await getAllStudents();
    const student = students.find(s => s.id === studentId);

    if (student && student.roomId) {
      const rooms = await getAllRooms();
      return rooms.find(r => r.id === student.roomId);
    }

    // Fallback search
    const rooms = await getAllRooms();
    return rooms.find(r =>
      (r.occupants || []).some(u => u.id === studentId) ||
      (r.Users || []).some(u => u.id === studentId)
    );
  } catch (e) {
    console.error('getStudentRoom Error:', e);
    return null;
  }
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
    const availableRoom = rooms.find(r => (r.occupants || []).length < r.capacity);

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
  // Backend already uses 'occupants' alias
  return rooms;
};

export const getAllStudents = async () => {
  return await apiCall('/api/students');
};

export const getUserById = async (id) => {
  const students = await getAllStudents();
  return students.find(s => s.id === id);
};
