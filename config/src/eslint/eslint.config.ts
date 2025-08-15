/** @format */

// @ts-check

import type { TSESLint } from "@typescript-eslint/utils"

import { default as eslint, default as js } from "@eslint/js"
import prettierRecommended from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"

const eslintConfig: TSESLint.FlatConfig.ConfigArray = tseslint.config([
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			".eslintrc.js",
		],
	},
	js.configs.recommended,
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		files: ["**/*.{ts,tsx,js}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
		},
		plugins: {},
		rules: {
			// Reasonable defaults for CLI apps, packages, and plugins
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"no-console": "off", // CLI apps often use console
			"prefer-const": "warn",
			eqeqeq: ["warn", "always"],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/member-ordering": "off",
			"prettier/prettier": "warn",
		},
	},
	prettierRecommended,
])

export default eslintConfig
