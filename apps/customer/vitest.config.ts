import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: [fileURLToPath(new URL("../../packages/web-shared/src/test/setup.ts", import.meta.url))],
      env: {
        // Unit/component tests never hit a real API, regardless of local .env.
        VITE_USE_MOCKS: "true",
      },
    },
  }),
);
