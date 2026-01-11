import { apiCall } from './api.js';

const STORAGE_KEY = 'amu_dorm_user';
const TOKEN_KEY = 'amu_dorm_token';

export const initAuth = () => {
  // Logic to check session validity if needed
};

export const register = async (userData) => {
  try {
    const result = await apiCall('/auth/register', 'POST', userData);
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const login = async (id, password) => {
  try {
    const result = await apiCall('/auth/login', 'POST', { id, password });
    if (result.success) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      localStorage.setItem(TOKEN_KEY, result.token);
    }
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.location.hash = '#/login';
  window.location.reload();
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getUser();
};

export const updateUser = async (updatedData) => {
  try {
    const result = await apiCall('/api/profile', 'PATCH', updatedData);
    if (result.success) {
      // Update local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    }
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getUserById = async (id) => {
  try {
    // If it's current user, return from cache or fetch
    // Use API to fetch specific user if needed (e.g. for admin)
    // For now, simpler to just fetch student list or profile
    // But data.js usually calls this.
    // Let's implement a fetch
    // But wait, API doesn't have /users/:id.
    // We have /students which returns all.
    // Let's assume for now we use the list or add endpoint.
    // For this step, I'll return null or implement if I add endpoint.
    // I'll add a helper to find from /students cache if efficient, or add endpoint.
    // Let's rely on data.js refactor for this.
    return null;
  } catch (error) {
    return null;
  }
};
