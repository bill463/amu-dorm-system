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
  return rooms;
};

export const getAllStudents = async () => {
  return await apiCall('/api/students');
};

export const getUserById = async (id) => {
  const students = await getAllStudents();
  return students.find(s => s.id === id);
};

export const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    padding: '1rem 2rem',
    borderRadius: '12px',
    background: type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#1e293b'),
    color: 'white',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    zIndex: '9999',
    transition: 'all 0.3s ease',
    opacity: '0',
    transform: 'translateY(1rem)'
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(1rem)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export const deleteRequest = async (id) => {
  return await apiCall(`/api/requests/${id}`, 'DELETE');
};
