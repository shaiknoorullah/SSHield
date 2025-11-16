/** @format */

import { defineConfig, type Options } from "tsup"

/**
 * Base tsup configuration for SSHield packages
 * This can be extended/overridden in individual packages
 */
const baseTsupConfig: Options = {
	// Entry points - should be overridden in package
	entry: ["src/index.ts"],

	// Output formats
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

	// Target environment
	target: "es2015",

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
}

export default baseTsupConfig

// Also export defineConfig for convenience
export { defineConfig }
