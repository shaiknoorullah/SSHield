/** @format */

import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	tsconfig: "./tsconfig.json",
	format: ["cjs"],
	dts: true, // Set to true if you want .d.ts files
	minify: true,
	treeshake: true,
	clean: false,
	outDir: "dist",
	target: "node20",
	splitting: false,
	shims: false,
	banner: {
		js: "#!/usr/bin/env node",
	},
})
