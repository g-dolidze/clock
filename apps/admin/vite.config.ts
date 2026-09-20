import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../../packages/web-shared/src", import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.PORT ?? 5175),
    fs: {
      allow: [fileURLToPath(new URL("../../", import.meta.url))],
    },
    proxy: {
      "/v1": { target: apiProxyTarget, changeOrigin: true },
      "/health": { target: apiProxyTarget, changeOrigin: true },
    },
  },
});
