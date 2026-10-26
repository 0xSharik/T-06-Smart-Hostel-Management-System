import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/recharts/") || /\/d3-[^/]+\//.test(id)) return "charts";
          if (id.includes("/react-dom/") || id.includes("/react-router/") || id.includes("/react/")) return "react-vendor";
          if (id.includes("/lucide-react/")) return "icons";
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to the backend during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
