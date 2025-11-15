/** @format */

/**
 * Base c8 configuration for SSHield packages
 * c8 is the modern code coverage tool using V8's built-in coverage
 */
interface C8Config {
	all?: boolean
	"check-coverage"?: boolean
	lines?: number
	functions?: number
	branches?: number
	statements?: number
	include?: string[]
	exclude?: string[]
	extension?: string[]
	reporter?: string[]
	"report-dir"?: string
	"temp-directory"?: string
	"skip-full"?: boolean
	clean?: boolean
	"100"?: boolean
	src?: string[]
	"exclude-after-remap"?: boolean
}

const c8Config: C8Config = {
	// Include all files in coverage
	all: true,

	// Enforce coverage thresholds
	"check-coverage": true,
	lines: 90,
	functions: 90,
	branches: 90,
	statements: 90,

	// Files to include in coverage
	include: ["src/**/*.ts", "src/**/*.tsx"],

	// Files to exclude from coverage
	exclude: [
		"**/*.spec.ts",
		"**/*.test.ts",
		"**/*.test.tsx",
		"**/*.d.ts",
		"**/node_modules/**",
		"**/dist/**",
		"**/coverage/**",
		"**/*.config.ts",
		"**/*.config.js",
	],

	// File extensions to process
	extension: [".ts", ".tsx"],

	// Coverage reporters
	reporter: ["text", "lcov", "html", "json-summary"],

	// Output directory for coverage reports
	"report-dir": "./coverage",

	// Temporary directory for coverage data
	"temp-directory": "./.c8",

	// Clean coverage directory before running
	clean: true,

	// Skip files with 100% coverage in reports
	"skip-full": false,

	// Source directories
	src: ["src"],

	// Exclude files after remapping
	"exclude-after-remap": true,
}

export default c8Config
