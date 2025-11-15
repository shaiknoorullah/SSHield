/** @format */

import type { KnipConfig } from "knip"

/**
 * Knip configuration for SSHield monorepo
 * Finds unused files, dependencies, and exports
 */
const config: KnipConfig = {
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

	ignoreDependencies: [
		"@types/*",
		"typescript",
		"tslib",
		"@nx/*",
		"lefthook", // Used via CLI
	],

	ignoreExportsUsedInFile: true,
	includeEntryExports: true,

	prettier: {
		config: ["prettier.config.{js,mjs,cjs,ts}"],
	},

	eslint: {
		config: ["eslint.config.{js,mjs,cjs,ts}"],
	},

	typescript: {
		config: ["tsconfig.json", "tsconfig.*.json"],
	},

	ignoreBinaries: [],
}

export default config
