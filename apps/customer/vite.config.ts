import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The API binds IPv4-only; some environments resolve `localhost` to IPv6
// first, which produces ECONNREFUSED against a server that never listens
// on ::1. Pinning to 127.0.0.1 sidesteps that entirely.
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Resolves outside this app's own root, into the shared package, so
      // one fix in web-shared lands in the customer, restaurant and admin
      // apps at once — nothing to duplicate across the three.
      "@shared": fileURLToPath(new URL("../../packages/web-shared/src", import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.PORT ?? 5173),
    fs: {
      // Widened so Vite can serve @shared, which lives outside apps/customer.
      allow: [fileURLToPath(new URL("../../", import.meta.url))],
    },
    proxy: {
      "/v1": { target: apiProxyTarget, changeOrigin: true },
      "/health": { target: apiProxyTarget, changeOrigin: true },
      "/socket.io": { target: apiProxyTarget, changeOrigin: true, ws: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keeps the framework code in stable, separately-cached chunks so
        // redeploying the app doesn't bust the browser cache for it.
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (/[\\/](react|react-dom)[\\/]/.test(id)) return "vendor-react";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("@tanstack") || id.includes("zustand")) return "vendor-data";
            if (id.includes("/zod/")) return "vendor-zod";
            if (id.includes("date-fns")) return "vendor-date";
          }
          return undefined;
        },
      },
    },
  },
});
