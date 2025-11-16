/** @format */

/**
 * Base Mocha configuration for SSHield packages
 * Includes ts-node, chai, and source-map support
 */
const mochaConfig = {
	// Required modules
	require: [
		"ts-node/register",
		"source-map-support/register",
	],

	// File extensions to process
	extensions: ["ts"],

	// Test file patterns
	spec: ["src/**/*.spec.ts", "src/**/*.test.ts"],

	// Recursively look for tests
	recursive: true,

	// Test timeout (5 seconds)
	timeout: 5000,

	// Reporter style
	reporter: "spec",

	// Colorize output
	color: true,

	// Exit after tests complete
	exit: true,

	// Node options for ESM support
	"node-option": ["loader=ts-node/esm"],

	// ts-node configuration
	"ts-node": {
		project: "tsconfig.spec.json",
		transpileOnly: true,
		files: true,
	},

	// Watch mode file patterns
	watchFiles: ["src/**/*.ts", "src/**/*.spec.ts", "src/**/*.test.ts"],

	// Fail fast on first error
	bail: false,

	// Enable full stack traces
	fullTrace: false,

	// Check for global leaks
	checkLeaks: false,
}

export default mochaConfig
