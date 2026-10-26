/**
 * src/main.jsx — React Application Bootstrap
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

const savedTheme = localStorage.getItem("hostel-theme");
if (savedTheme === "dark" || savedTheme === "light") {
  document.documentElement.dataset.theme = savedTheme;
}

// Configure React Query with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "var(--bg-card)" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "var(--bg-card)" },
          },
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
