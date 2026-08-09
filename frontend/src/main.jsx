/**
 * src/main.jsx — React Application Bootstrap
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

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
            background: "#1e2438",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#1e2438" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#1e2438" },
          },
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
