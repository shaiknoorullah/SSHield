/** @format */

import { defineConfig } from "cz-git"
import { readdirSync } from "node:fs"
import { resolve } from "node:path"
import _ from "lodash"

/**
 * cz.config.ts
 * This file configures the commitizen prompt for generating commit messages.
 * It defines the structure and options available to users when making commits.
 */

const scopes = _.union(
	readdirSync(resolve(__dirname, "packages")),
	readdirSync(resolve(__dirname, "plugins")),
	readdirSync(resolve(__dirname, "tests")),
	readdirSync(resolve(__dirname, "config")),
	readdirSync(resolve(__dirname, "docs")),
	readdirSync(resolve(__dirname, "tools"))
)

const czConfig = {
	rules: {
		// @see: https://commitlint.js.org/#/reference-rules
		"body-leading-blank": [2, "always"],
		"body-empty": [2, "always"],
		"body-max-line-length": [2, "always", 10],
		"body-max-length": [2, "always", 250],
		"body-min-length": [2, "always", 25],
		"references-empty": [2, "always"],
		"scope-case": [2, "always", "kebab-case"],
		"scope-enum": [2, "always", [...scopes]],
		"subject-case": [2, "always", "lower-case"],
		"header-case": [2, "always", "lower-case"],
		"subject-empty": [2, "always"],
		"header-min-length": [2, "always", 10],
		"header-max-length": [2, "always", 100],
		"type-case": [2, "always", "kebab-case"],
		"type-empty": [2, "always"],
		"type-enum": [2, "always", []],
		"type-max-length": [2, "always", 10],
	},
	prompt: {
		alias: { fd: "docs: fix typos" },
		messages: {
			type: "Select the type of change that you're committing:",
			scope: "Denote the SCOPE of this change (optional):",
			customScope: "Denote the SCOPE of this change:",
			subject: "Write a SHORT, IMPERATIVE tense description of the change:\n",
			body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
			breaking:
				'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
			footerPrefixsSelect:
				"Select the ISSUES type of changeList by this change (optional):",
			customFooterPrefix: "Input ISSUES prefix:",
			footer: "List any ISSUES by this change. E.g.: #31, #34:\n",
			generatingByAI: "Generating your AI commit subject...",
			generatedSelectByAI: "Select suitable subject by AI generated:",
			confirmCommit: "Are you sure you want to proceed with the commit above?",
		},
		types: [
			{ value: "feat", name: "feat:     A new feature", emoji: ":sparkles:" },
			{ value: "fix", name: "fix:      A bug fix", emoji: ":bug:" },
			{
				value: "docs",
				name: "docs:     Documentation only changes",
				emoji: ":memo:",
			},
			{
				value: "style",
				name: "style:    Changes that do not affect the meaning of the code",
				emoji: ":lipstick:",
			},
			{
				value: "refactor",
				name: "refactor: A code change that neither fixes a bug nor adds a feature",
				emoji: ":recycle:",
			},
			{
				value: "perf",
				name: "perf:     A code change that improves performance",
				emoji: ":zap:",
			},
			{
				value: "test",
				name: "test:     Adding missing tests or correcting existing tests",
				emoji: ":white_check_mark:",
			},
			{
				value: "build",
				name: "build:    Changes that affect the build system or external dependencies",
				emoji: ":package:",
			},
			{
				value: "ci",
				name: "ci:       Changes to our CI configuration files and scripts",
				emoji: ":ferris_wheel:",
			},
			{
				value: "chore",
				name: "chore:    Other changes that don't modify src or test files",
				emoji: ":hammer:",
			},
			{
				value: "maintenance",
				name: "maintenance:    Maintenance tasks that do not modify src or test files",
				emoji: ":screwdriver:",
			},
			{
				value: "init",
				name: "init:    Initialize a new plugin or package",
				emoji: ":rocket:",
			},
			{
				value: "revert",
				name: "revert:   Reverts a previous commit",
				emoji: ":rewind:",
			},
		],
		useEmoji: false,
		emojiAlign: "center",
		useAI: false,
		aiNumber: 1,
		themeColorCode: "",
		scopes: [...scopes],
		allowCustomScopes: false,
		allowEmptyScopes: false,
		enableMultipleScopes: true,
		scopeEnumSeparator: ",",
		upperCaseSubject: null,
		markBreakingChangeMode: false,
		allowBreakingChanges: ["feat", "fix"],
		breaklineNumber: 100,
		breaklineChar: "|",
		skipQuestions: [],
		issuePrefixes: [
			{ value: "closed", name: "closed:   ISSUES has been processed" },
			{ value: "fixes", name: "fixes:   ISSUES has been fixed" },
		],
		customIssuePrefixAlign: "top",
		emptyIssuePrefixAlias: "skip",
		customIssuePrefixAlias: "custom",
		allowCustomIssuePrefix: false,
		allowEmptyIssuePrefix: false,
		confirmColorize: true,
		scopeOverrides: undefined,
		defaultBody: "",
		defaultIssues: "",
		defaultScope: "",
		defaultSubject: "",
	},
}

export default defineConfig(czConfig)
