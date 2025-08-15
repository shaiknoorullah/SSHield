/** @format */
// import nycConfig from "@sshield/config/nyc/config"

export default {
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
