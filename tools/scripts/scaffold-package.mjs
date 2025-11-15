#!/usr/bin/env node
/** @format */

import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)

function parseArgs() {
	const options = {
		name: null,
		description: "",
		directory: "packages",
		addTests: true,
	}

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]
		if (arg === "--directory" || arg === "-d") {
			options.directory = args[++i]
		} else if (arg === "--description" || arg === "--desc") {
			options.description = args[++i]
		} else if (arg === "--no-tests") {
			options.addTests = false
		} else if (!arg.startsWith("-")) {
			options.name = arg
		}
	}

	if (!options.name) {
		console.error("Error: Package name is required")
		console.log("Usage: pnpm scaffold <name> [options]")
		console.log("Options:")
		console.log("  --directory, -d <dir>    Directory (packages|plugins) [default: packages]")
		console.log("  --description <desc>     Package description")
		console.log("  --no-tests               Skip test setup")
		process.exit(1)
	}

	return options
}

function toPascalCase(str) {
	return str
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("")
}

function toKebabCase(str) {
	return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

function scaffoldPackage(options) {
	const name = toKebabCase(options.name)
	const projectName = `@sshield/${name}`
	const projectRoot = path.join(process.cwd(), options.directory, name)

	console.log(`\nScaffolding ${projectName}...`)
	console.log(`Directory: ${projectRoot}\n`)

	// Create directories
	fs.mkdirSync(projectRoot, { recursive: true })
	fs.mkdirSync(path.join(projectRoot, "src"), { recursive: true })

	// Create package.json
	const packageJson = {
		name: projectName,
		version: "1.0.0",
		description: options.description || `${projectName} package`,
		type: "commonjs",
		main: "dist/index.js",
		types: "dist/index.d.ts",
		scripts: {
			build: "nx build",
			test: "nx test",
			lint: "nx lint",
			typecheck: "nx typecheck",
		},
		dependencies: {},
		devDependencies: {
			"@sshield/config": "workspace:^",
		},
		publishConfig: {
			access: "public",
		},
	}

	fs.writeFileSync(
		path.join(projectRoot, "package.json"),
		JSON.stringify(packageJson, null, 2),
	)

	// Create project.json
	const projectJson = {
		name: projectName,
		$schema: `../../node_modules/nx/schemas/project-schema.json`,
		sourceRoot: `${options.directory}/${name}/src`,
		projectType: "library",
		tags: [],
		targets: {
			build: {
				executor: "@nx/js:tsc",
				outputs: ["{options.outputPath}"],
				cache: true,
				options: {
					outputPath: `${options.directory}/${name}/dist`,
					main: `${options.directory}/${name}/src/index.ts`,
					tsConfig: `${options.directory}/${name}/tsconfig.lib.json`,
					assets: ["*.md"],
					clean: true,
				},
			},
			lint: {
				executor: "@nx/eslint:lint",
				outputs: ["{options.outputFile}"],
				options: {
					lintFilePatterns: [`${options.directory}/${name}/**/*.ts`],
				},
			},
		},
	}

	if (options.addTests) {
		projectJson.targets.test = {
			executor: "@nx/js:node",
			outputs: [],
			options: {
				command: `mocha --config ${options.directory}/${name}/.mocharc.json '${options.directory}/${name}/src/**/*.spec.ts'`,
			},
		}
	}

	fs.writeFileSync(
		path.join(projectRoot, "project.json"),
		JSON.stringify(projectJson, null, 2),
	)

	// Create tsconfig.json
	const tsconfigJson = {
		extends: "../../config/ts/tsconfig.base.json",
		compilerOptions: {
			rootDir: ".",
		},
		exclude: ["node_modules", "dist"],
	}

	fs.writeFileSync(
		path.join(projectRoot, "tsconfig.json"),
		JSON.stringify(tsconfigJson, null, 2),
	)

	// Create tsconfig.lib.json
	const tsconfigLibJson = {
		extends: "../../config/ts/tsconfig.lib.json",
		compilerOptions: {
			outDir: "./dist",
			rootDir: "./src",
			declaration: true,
			types: ["node"],
		},
		include: ["src/**/*.ts"],
		exclude: ["node_modules", "dist", "**/*.spec.ts"],
	}

	fs.writeFileSync(
		path.join(projectRoot, "tsconfig.lib.json"),
		JSON.stringify(tsconfigLibJson, null, 2),
	)

	// Create eslint.config.mjs
	const eslintConfig = `/** @format */
import { eslintConfig } from "@sshield/config"

export default [
	...eslintConfig,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
]
`

	fs.writeFileSync(path.join(projectRoot, "eslint.config.mjs"), eslintConfig)

	// Create .prettierrc.json
	const prettierConfig = {
		extends: "@sshield/config/prettier",
	}

	fs.writeFileSync(
		path.join(projectRoot, ".prettierrc.json"),
		JSON.stringify(prettierConfig, null, 2),
	)

	// Create src/index.ts
	const indexTs = `/** @format */

/**
 * ${options.description || projectName}
 * @module ${projectName}
 */

export function hello(): string {
	return "Hello from ${projectName}"
}
`

	fs.writeFileSync(path.join(projectRoot, "src", "index.ts"), indexTs)

	// Create README.md
	const readme = `# ${projectName}

${options.description || projectName}

## Installation

\`\`\`bash
pnpm add ${projectName}
\`\`\`

## Usage

\`\`\`typescript
import { hello } from '${projectName}'

console.log(hello())
\`\`\`

## Development

\`\`\`bash
# Build
pnpm nx build ${projectName}

# Test
pnpm nx test ${projectName}

# Lint
pnpm nx lint ${projectName}

# Type check
pnpm nx typecheck ${projectName}
\`\`\`

## License

MIT
`

	fs.writeFileSync(path.join(projectRoot, "README.md"), readme)

	if (options.addTests) {
		// Create .mocharc.json
		const mochaConfig = {
			extension: ["ts"],
			spec: "src/**/*.spec.ts",
			require: ["ts-node/register"],
			"node-option": ["loader=ts-node/esm"],
		}

		fs.writeFileSync(
			path.join(projectRoot, ".mocharc.json"),
			JSON.stringify(mochaConfig, null, 2),
		)

		// Create src/index.spec.ts
		const indexSpecTs = `/** @format */
import { describe, it } from "mocha"
import { expect } from "chai"
import { hello } from "./index"

describe("${projectName}", () => {
	describe("hello", () => {
		it("should return a greeting message", () => {
			const result = hello()
			expect(result).to.equal("Hello from ${projectName}")
		})
	})
})
`

		fs.writeFileSync(
			path.join(projectRoot, "src", "index.spec.ts"),
			indexSpecTs,
		)
	}

	console.log(`✅ Successfully scaffolded ${projectName}`)
	console.log(`\nNext steps:`)
	console.log(`  1. cd ${options.directory}/${name}`)
	console.log(`  2. pnpm install`)
	console.log(`  3. pnpm nx build ${projectName}`)
	console.log(``)
}

const options = parseArgs()
scaffoldPackage(options)
