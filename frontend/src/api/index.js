/**
 * src/api/index.js — All API Service Functions
 *
 * Each function maps to one backend endpoint.
 * Components and hooks import from here — never call axios directly in components.
 */

import api from "./axios";

// ── Auth ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  changePassword: (data) => api.patch("/auth/change-password", data),
};

// ── Students ────────────────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  assignRoom: (id, roomId) => api.post(`/students/${id}/assign-room`, { roomId }),
  unassignRoom: (id) => api.post(`/students/${id}/unassign-room`),
};

// ── Rooms ───────────────────────────────────────────────────────────
export const roomAPI = {
  getAll: (params) => api.get("/rooms", { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  getStats: () => api.get("/rooms/stats"),
  runAllotment: (data) => api.post("/rooms/allot", data),
  create: (data) => api.post("/rooms", data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// ── Visitors ────────────────────────────────────────────────────────
export const visitorAPI = {
  getAll: (params) => api.get("/visitors", { params }),
  getByStudent: (studentId, params) => api.get(`/visitors/student/${studentId}`, { params }),
  logEntry: (data) => api.post("/visitors", data),
  generateQR: (data) => api.post("/visitors/generate-qr", data),
  scanQR: (qrToken) => api.post("/visitors/scan-qr", { qrToken }),
  logExit: (id) => api.patch(`/visitors/${id}/exit`),
};

// ── Maintenance ─────────────────────────────────────────────────────
export const maintenanceAPI = {
  getAll: (params) => api.get("/maintenance", { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  getStats: () => api.get("/maintenance/stats"),
  getSLABreaches: () => api.get("/maintenance/sla-breaches"),
  create: (data) => api.post("/maintenance", data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  updateStatus: (id, data) => api.patch(`/maintenance/${id}/status`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// ── Mess ────────────────────────────────────────────────────────────
export const messAPI = {
  getWeeklyMenu: () => api.get("/mess/menu"),
  getMenuById: (id) => api.get(`/mess/menu/${id}`),
  createMenuItem: (data) => api.post("/mess/menu", data),
  updateMenuItem: (id, data) => api.put(`/mess/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/mess/menu/${id}`),
  getFeedbacks: (params) => api.get("/mess/feedback", { params }),
  getWeeklyTrend: () => api.get("/mess/feedback/trend"),
  submitFeedback: (data) => api.post("/mess/feedback", data),
};

// ── Holidays ────────────────────────────────────────────────────────
export const holidayAPI = {
  getAll: (params) => api.get("/holidays", { params }),
  getUpcoming: (limit) => api.get("/holidays/upcoming", { params: { limit } }),
  getById: (id) => api.get(`/holidays/${id}`),
  create: (data) => api.post("/holidays", data),
  update: (id, data) => api.put(`/holidays/${id}`, data),
  delete: (id) => api.delete(`/holidays/${id}`),
  createLeaveRequest: (data) => api.post("/holidays/leave-request", data),
  getLeaveRequests: (params) => api.get("/holidays/leave-requests", { params }),
  updateLeaveStatus: (id, status) => api.patch(`/holidays/leave-requests/${id}/status`, { status }),
  confirmLeaveReturn: (id) => api.patch(`/holidays/leave-requests/${id}/confirm-return`),
};

// ── Dashboard ───────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getOccupancyByFloor: () => api.get("/dashboard/occupancy-by-floor"),
  getMaintenanceByStatus: () => api.get("/dashboard/maintenance-by-status"),
};

// ── Notifications ───────────────────────────────────────────────────
export const notificationAPI = {
  getMyNotifications: (params) => api.get("/notifications", { params }),
  create: (data) => api.post("/notifications", data),
  broadcast: (data) => api.post("/notifications/broadcast", data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/mark-all-read"),
  delete: (id) => api.delete(`/notifications/${id}`),
};
