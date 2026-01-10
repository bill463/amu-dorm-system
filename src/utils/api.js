const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'API Error');
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}
