// https://docs.expo.dev/guides/monorepos/ — npm workspaces hoist shared
// deps (and @ontime/web-shared itself) up to the repo root, so Metro needs
// to know about that root to resolve and watch them.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// @ontime/web-shared's package.json uses "exports" to expose a
// React-free "./server" entry point (types + formatting helpers only) —
// the one this app imports, so it never pulls in web-shared's DOM
// components.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
