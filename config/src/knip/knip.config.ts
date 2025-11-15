/** @format */

import type { KnipConfig } from "knip";

/**
 * Base knip configuration for SSHield monorepo
 * Finds unused files, dependencies, and exports
 */
const knipConfig: KnipConfig = {
  // Include all workspaces
  workspaces: {
    ".": {
      entry: ["src/index.ts", "src/cli.ts", "src/main.ts"],
      project: ["src/**/*.ts", "src/**/*.tsx"],
    },
    "packages/*": {
      entry: ["src/index.ts", "src/index.tsx", "src/cli.ts", "src/main.ts"],
      project: ["src/**/*.ts", "src/**/*.tsx"],
    },
    config: {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
    },
  },

  // Ignore patterns
  ignore: [
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.config.ts",
    "**/*.config.js",
    "**/dist/**",
    "**/coverage/**",
    "**/.nx/**",
    "**/node_modules/**",
  ],

  // Ignore dependencies (these are commonly used implicitly)
  ignoreDependencies: [
    "@types/*", // Type definitions
    "typescript", // TypeScript compiler
    "tslib", // TypeScript helpers
    "@nx/*", // Nx packages
  ],

  // Ignore exports (public API exports that might be unused internally)
  ignoreExportsUsedInFile: true,

  // Include entry files
  includeEntryExports: true,

  // Plugins
  prettier: {
    config: ["prettier.config.{js,mjs,cjs,ts}"],
  },

  eslint: {
    config: ["eslint.config.{js,mjs,cjs,ts}"],
  },

  typescript: {
    config: ["tsconfig.json", "tsconfig.*.json"],
  },

  // Include bin/executables
  ignoreBinaries: [],
};

export default knipConfig;
export type { KnipConfig };
