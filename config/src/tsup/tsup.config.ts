/** @format */

import { defineConfig, type Options } from "tsup";

/**
 * Base tsup configuration for SSHield library packages
 * Use this for packages that will be consumed by other packages
 *
 * This can be extended/overridden in individual packages
 */
const baseTsupConfig: Options = {
  // Entry points - should be overridden in package
  entry: ["src/index.ts"],

  // Output formats - both CJS and ESM for maximum compatibility
  format: ["cjs", "esm"],

  // Output directory
  outDir: "dist",

  // TypeScript declarations
  dts: true,

  // Source maps for debugging
  sourcemap: true,

  // Clean output directory before build
  clean: true,

  // Split output into chunks
  splitting: false,

  // Tree shaking
  treeshake: true,

  // Minification for production
  minify: false,

  // Target environment - Node 18+
  target: "node18",

  // Platform
  platform: "node",

  // External dependencies (don't bundle)
  external: [],

  // Skip node_modules bundling
  skipNodeModulesBundle: true,

  // Keep names for better debugging
  keepNames: true,

  // Banner to add to output files
  banner: {
    js: "/** @format */",
  },
};

/**
 * CLI-specific tsup configuration for bundling executables
 * Use this for CLI applications that need to be bundled into a single file
 *
 * IMPORTANT: Uses ESM format because:
 * - Many modern CLI frameworks (like Ink with React) use top-level await
 * - Top-level await is only supported in ESM, not CommonJS
 * - ESM is the future of Node.js modules
 *
 * For packages using this config:
 * - ✅ npm/npx distribution works perfectly
 * - ✅ nfpm system packages (.deb, .rpm, .apk) work
 * - ❌ pkg binary packaging does NOT work (pkg only supports CJS)
 */
const cliTsupConfig: Options = {
  // Entry point - override in package
  entry: ["src/cli.ts"],

  // ESM format - required for top-level await (used by Ink and other modern frameworks)
  format: ["esm"],

  // Target Node 18+
  target: "node18",

  // Bundle output directory
  outDir: "dist-bundle",

  // Clean before build
  clean: true,

  // Source maps
  sourcemap: true,

  // Bundle everything
  bundle: true,
  noExternal: [/.*/], // Bundle all dependencies

  // Platform
  platform: "node",

  // Tree shaking
  treeshake: true,

  // No splitting for single executable
  splitting: false,

  // No type declarations needed for bundled output
  dts: false,

  // Minification
  minify: false,

  // ESM shims - add __dirname and __filename for ESM compatibility
  shims: true,

  // Banner - add shebang for direct execution
  banner: {
    js: "#!/usr/bin/env node",
  },

  onSuccess: "echo 'ESM bundle created successfully'",
};

export default baseTsupConfig;

// Export both configurations
export { baseTsupConfig, cliTsupConfig };

// Also export defineConfig for convenience
export { defineConfig };
