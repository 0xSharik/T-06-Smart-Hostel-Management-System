/**
 * src/store/authStore.js — Zustand Auth Store
 *
 * Single source of truth for authentication state.
 * Persisted to localStorage so the user stays logged in on refresh.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });
          const { user, token } = response.data.data;
          localStorage.setItem("token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "Login failed",
          };
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Ignore errors — clear client state regardless
        } finally {
          localStorage.removeItem("token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      refreshUser: async () => {
        try {
          const response = await api.get("/auth/me");
          set({ user: response.data.data });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "hostel-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
