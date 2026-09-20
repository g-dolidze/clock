// Server-safe subset of @ontime/web-shared: types, DTOs, socket event
// constants and pure formatting helpers only — no React components or
// hooks, so apps/api (a plain Node backend with no JSX in its tsconfig)
// can depend on it without pulling in a UI toolchain.
export * from "./types/index";
export * from "./types/api";
export * from "./lib/format";
