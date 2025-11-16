/** @format */

/**
 * pkg configuration for building standalone binaries
 * Using @yao-pkg/pkg - active fork with Node 20+ support
 * @see https://github.com/yao-pkg/pkg
 *
 * ⚠️ IMPORTANT LIMITATIONS:
 *
 * pkg ONLY supports CommonJS (CJS) format. It does NOT work with:
 * - ESM (ECMAScript Modules)
 * - Top-level await (ESM feature)
 * - Modern frameworks like Ink (React for CLIs) that use ESM + top-level await
 *
 * If your CLI uses any of the above, pkg will NOT work. Use these alternatives instead:
 *
 * ✅ Recommended distribution methods:
 * 1. npm/npx - Primary method, works perfectly with ESM
 * 2. nfpm system packages (.deb, .rpm, .apk) - Works with ESM CLIs
 * 3. Docker containers - Works with any Node.js app
 *
 * ❌ pkg is NOT compatible with:
 * - Ink-based CLIs (uses React + top-level await)
 * - Any CLI using top-level await
 * - Pure ESM packages
 *
 * This configuration is provided for packages that:
 * - Use pure CommonJS (no ESM, no top-level await)
 * - Need standalone binaries for air-gapped environments
 * - Don't use modern CLI frameworks like Ink
 *
 * If you're building a new CLI, strongly consider using ESM + npm/nfpm instead.
 */
interface PkgConfig {
  scripts?: string[];
  assets?: string[];
  targets?: string[];
  outputPath?: string;
  compress?: "Brotli" | "GZip" | "None";
  name?: string;
  output?: string;
}

const pkgConfig: PkgConfig = {
  // Scripts to include in the binary
  scripts: ["dist/**/*.js"],

  // Assets to include (configs, templates, etc.)
  assets: ["package.json", "dist/**/*.json", "dist/**/*.md"],

  // Target platforms and Node versions
  // Format: node<version>-<platform>-<arch>
  // Supports Node 20+ with @yao-pkg/pkg
  targets: [
    // Linux
    "node20-linux-x64",
    "node20-linux-arm64",
    // macOS
    "node20-macos-x64",
    "node20-macos-arm64",
    // Windows
    "node20-win-x64",
    "node20-win-arm64",
    // Alpine Linux (musl)
    "node20-alpine-x64",
    "node20-alpine-arm64",
  ],

  // Compression (Brotli for best compression)
  compress: "Brotli",
};

export default pkgConfig;
export type { PkgConfig };
