const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('amu_dorm_token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle unauthorized globally
    if (response.status === 401) {
      localStorage.removeItem('amu_dorm_user');
      localStorage.removeItem('amu_dorm_token');
      window.location.hash = '#/login';
      return null;
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'API Error');
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}
