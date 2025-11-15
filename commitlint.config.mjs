/** @format */

/**
 * Commitlint configuration for SSHield monorepo
 * Extends the base configuration from @sshield/config
 */
export default {
	extends: ["@commitlint/config-conventional"],

	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"docs",
				"style",
				"refactor",
				"perf",
				"test",
				"build",
				"ci",
				"chore",
				"revert",
				"release",
			],
		],

		"scope-enum": [
			2,
			"always",
			[
				"config",
				"core",
				"cli",
				"api",
				"ui",
				"docs",
				"deps",
				"test",
				"ci",
				"build",
				"release",
			],
		],

		"scope-empty": [1, "never"],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"subject-case": [2, "always", "lower-case"],
		"header-max-length": [2, "always", 100],
		"body-leading-blank": [2, "always"],
		"footer-leading-blank": [2, "always"],
		"type-case": [2, "always", "lower-case"],
		"type-empty": [2, "never"],
		"scope-case": [2, "always", "lower-case"],
	},
}
