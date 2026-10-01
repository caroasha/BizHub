import api from '../axios';

const BASE = '/resto/orders';

export const getOrders = (params) => api.get(BASE, { params });
export const getOrder = (id) => api.get(`${BASE}/${id}`);
export const getOrderStats = () => api.get(`${BASE}/stats`);
export const createOrder = (data) => api.post(BASE, data);
export const updateOrderStatus = (id, status) => api.patch(`${BASE}/${id}/status`, { status });
export const confirmOrderPayment = (id) => api.patch(`${BASE}/${id}/payment`);
export const cancelOrder = (id) => api.patch(`${BASE}/${id}/cancel`);
export const dispatchOrder = (id) => api.patch(`${BASE}/${id}/dispatch`);