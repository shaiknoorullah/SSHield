/** @format */

import { defineConfig, type Options } from "tsup"

const baseConfig: Options = {}

export default [
	defineConfig({
		...baseConfig,
		target: ["es2015"],
	}),
]
