/** @format */

import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/cli.ts"],
	format: ["esm"], // Use ESM - top-level await compatible
	target: "node18",
	outDir: "dist-bundle",
	clean: true,
	minify: false,
	sourcemap: true,
	bundle: true,
	noExternal: [/.*/], // Bundle all dependencies
	platform: "node",
	treeshake: true,
	splitting: false,
	dts: false, // No need for types in bundled output
	shims: true, // Add __dirname and __filename shims for ESM
	banner: {
		js: "#!/usr/bin/env node",
	},
	onSuccess: "echo 'ESM bundle created successfully'",
});
