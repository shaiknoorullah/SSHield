/** @format */

/**
 * Base release-it configuration for SSHield packages
 * Handles versioning, changelog, and publishing in monorepo
 */
interface ReleaseItConfig {
	git?: {
		commit?: boolean
		tag?: boolean
		push?: boolean
		commitMessage?: string
		tagName?: string
		requireBranch?: string | string[]
		requireCleanWorkingDir?: boolean
		requireUpstream?: boolean
		addUntrackedFiles?: boolean
	}
	npm?: {
		publish?: boolean
		publishPath?: string
		skipChecks?: boolean
		ignoreVersion?: boolean
	}
	github?: {
		release?: boolean
		releaseName?: string
		draft?: boolean
		preRelease?: boolean
	}
	gitlab?: {
		release?: boolean
	}
	plugins?: Record<string, any>
	hooks?: {
		"before:init"?: string | string[]
		"after:bump"?: string | string[]
		"after:release"?: string | string[]
	}
}

const releaseItConfig: ReleaseItConfig = {
	git: {
		commit: true,
		tag: true,
		push: true,
		commitMessage: "release: ${name}@${version}",
		tagName: "${name}@${version}",
		requireCleanWorkingDir: false, // Allow release with uncommitted changes
		requireUpstream: true,
		addUntrackedFiles: false,
	},

	npm: {
		publish: true,
		publishPath: ".",
		skipChecks: false,
		ignoreVersion: false,
	},

	github: {
		release: false, // Disable GitHub releases by default
		draft: false,
		preRelease: false,
	},

	gitlab: {
		release: false,
	},

	plugins: {
		"@release-it/conventional-changelog": {
			preset: {
				name: "conventionalcommits",
				types: [
					{ type: "feat", section: "Features" },
					{ type: "fix", section: "Bug Fixes" },
					{ type: "perf", section: "Performance Improvements" },
					{ type: "revert", section: "Reverts" },
					{ type: "docs", section: "Documentation" },
					{ type: "style", section: "Styles" },
					{ type: "refactor", section: "Code Refactoring" },
					{ type: "test", section: "Tests" },
					{ type: "build", section: "Build System" },
					{ type: "ci", section: "CI" },
					{ type: "chore", hidden: true },
				],
			},
			infile: "CHANGELOG.md",
			header: "# Changelog",
			gitRawCommitsOpts: {
				path: ".",
			},
		},
	},

	hooks: {
		"before:init": ["pnpm run build", "pnpm run test"],
		"after:bump": "echo Successfully bumped version to ${version}",
		"after:release":
			"echo Successfully released ${name}@${version} to ${repo.repository}",
	},
}

export default releaseItConfig
