/** @format */

import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/cli.ts"],
	format: ["cjs"], // pkg requires CommonJS
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
	onSuccess: "echo 'Bundle created successfully'",
});
