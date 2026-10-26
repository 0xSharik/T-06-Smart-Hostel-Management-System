/**
 * src/api/axios.js — Configured Axios Instance
 *
 * Single axios instance used by all API modules.
 * Handles auth token injection and global error responses.
 */

import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "https://t-06-smart-hostel-management-system.onrender.com/api").replace(/\/$/, ""),
  withCredentials: true, // Send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor — Attach Bearer token ─────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — Handle global errors ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Auto-redirect to login on 401 (except login route itself)
    if (status === 401 && !error.config.url.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("hostel-auth");

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }

      return Promise.reject(error);
    }

    // Show toast for 5xx server errors
    if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
