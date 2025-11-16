/** @format */

import { readdirSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import _ from "lodash"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Commitlint configuration for SSHield monorepo
 * Dynamically generates scopes from directory structure to match cz-git configuration
 */

// Dynamically read scopes from directories
const readDirSafe = (path) => {
	try {
		return existsSync(path) ? readdirSync(path) : []
	} catch {
		return []
	}
}

const scopes = _.union(
	readDirSafe(resolve(__dirname, "packages")),
	readDirSafe(resolve(__dirname, "plugins")),
	readDirSafe(resolve(__dirname, "tests")),
	readDirSafe(resolve(__dirname, "config")),
	readDirSafe(resolve(__dirname, "docs")),
	readDirSafe(resolve(__dirname, "tools"))
)

export default {
	extends: ["@commitlint/config-conventional"],

	rules: {
		// Type must be one of these - matches cz-git types
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
				"maintenance",
				"init",
				"revert",
				"release",
			],
		],

		// Scope must be one of the dynamically generated scopes
		"scope-enum": [2, "always", [...scopes]],

		// Scope rules
		"scope-empty": [1, "never"],
		"scope-case": [2, "always", "lower-case"],

		// Subject rules
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"subject-case": [2, "always", "lower-case"],

		// Header rules
		"header-max-length": [2, "always", 100],

		// Body rules
		"body-leading-blank": [2, "always"],

		// Footer rules
		"footer-leading-blank": [2, "always"],

		// Type rules
		"type-case": [2, "always", "lower-case"],
		"type-empty": [2, "never"],
	},
}
