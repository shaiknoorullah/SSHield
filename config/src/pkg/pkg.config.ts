/** @format */

/**
 * pkg configuration for building standalone binaries
 * Using @yao-pkg/pkg - active fork with Node 20+ support
 * @see https://github.com/yao-pkg/pkg
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
