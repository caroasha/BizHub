import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.error;

    // Maintenance mode
    if (status === 503 && errorCode === 'MAINTENANCE') {
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }

    // Subscription expired or module inactive → redirect to renewal
    if ((status === 402 || status === 403) && (errorCode === 'SUBSCRIPTION_EXPIRED' || errorCode === 'MODULE_INACTIVE')) {
      const user = JSON.parse(localStorage.getItem('bizhub_user') || '{}');
      const tenantId = user?.tenantId || '';
      const module = originalRequest?.url?.split('/')[1] || 'pharma';
      if (tenantId) {
        window.location.href = `/renewal?tenant=${tenantId}&module=${module}`;
      }
      return Promise.reject(error);
    }

    // Token expired → refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_URL}/api/v1/public/auth/refresh`, { refreshToken });
        const accessToken = res.data?.data?.accessToken || res.data?.accessToken;
        setToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;