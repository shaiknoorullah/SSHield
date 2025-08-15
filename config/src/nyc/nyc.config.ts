/** @format */

interface INycConfig {
	extends?: string
	include?: string[]
	exclude?: string[]
	reporter?: string[]
	"report-dir"?: string
	"check-coverage"?: Record<string, number> | boolean
	all?: boolean
	extension?: string[]
	lines?: number
	functions?: number
	branches?: number
	statements?: number
	watermarks?: {
		lines?: number[]
		functions?: number[]
		branches?: number[]
		statements?: number[]
	}
	"ignore-class-method"?: string[]
	"skip-full"?: boolean
	"temp-dir"?: string
}

const nycConfig: INycConfig = {
	extends: "@istanbuljs/nyc-config-typescript",
	include: ["src/**/*.ts"],
	exclude: ["**/*.spec.ts", "**/*.test.ts", "**/dist/**", "**/node_modules/**"],
	reporter: ["text", "html", "lcov"],
	extension: [".js", ".ts"],
	"check-coverage": true,
	lines: 90,
	functions: 80,
	branches: 80,
	statements: 80,
	watermarks: {
		lines: [80, 95],
		functions: [80, 95],
		branches: [80, 95],
		statements: [80, 95],
	},
	all: true,
}

export default nycConfig
