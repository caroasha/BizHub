import api from '../axios';

const BASE = '/resto/reservations';

export const getReservations = (params) => api.get(BASE, { params });
export const getReservation = (id) => api.get(`${BASE}/${id}`);
export const getTodayReservations = () => api.get(`${BASE}/today`);
export const getReservationStats = () => api.get(`${BASE}/stats`);
export const createReservation = (data) => api.post(BASE, data);
export const updateReservationStatus = (id, status) => api.patch(`${BASE}/${id}/status`, { status });
export const cancelReservation = (id) => api.patch(`${BASE}/${id}/cancel`);