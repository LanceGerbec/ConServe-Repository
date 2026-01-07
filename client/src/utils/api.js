// client/src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { status: 401 } }));
    throw new Error('No authentication token');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  // ✅ Global 401 handler
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { status: 401 } }));
    throw new Error('Session expired');
  }

  return response;
};