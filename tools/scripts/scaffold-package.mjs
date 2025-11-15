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
	const scope = "sshield"
	const projectName = `@${scope}/${name}`
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
			"build:bundle": "nx bundle",
			"build:binary": "nx pkg",
			test: "nx test",
			"test:coverage": "nx coverage",
			lint: "nx lint",
			typecheck: "nx typecheck",
		},
		dependencies: {},
		devDependencies: {
			"@sshield/config": "workspace:^",
			"@types/chai": "^4.3.20",
			"@types/mocha": "^10.0.10",
			"@types/node": "^18.19.120",
			"chai": "^4.5.0",
			"mocha": "^10.8.2",
			"nyc": "^17.1.0",
			"pkg": "^5.8.1",
			"source-map-support": "^0.5.21",
			"ts-mocha": "^10.0.0",
			"ts-node": "^10.9.2",
			"tsup": "^8.5.0",
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
			bundle: {
				executor: "nx:run-commands",
				options: {
					command: `pnpm --filter @${scope}/${name} exec tsup --config tsup.config.ts`,
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
			executor: "nx:run-commands",
			outputs: [],
			options: {
				command: `pnpm --filter @${scope}/${name} exec ts-mocha --config .mocharc.json`,
			},
		}

		projectJson.targets.coverage = {
			executor: "nx:run-commands",
			outputs: [`${options.directory}/${name}/coverage`],
			options: {
				command: `pnpm --filter @${scope}/${name} exec nyc --nycrc-path .nycrc.json ts-mocha --config .mocharc.json`,
			},
		}
	}

	// Add pkg target for binary building
	projectJson.targets.pkg = {
		executor: "nx:run-commands",
		dependsOn: ["build"],
		outputs: [`${options.directory}/${name}/bin`],
		options: {
			command: `pnpm --filter @${scope}/${name} exec pkg dist/index.js --config pkg.config.json --output bin/${name}`,
		},
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

	// Create tsconfig.spec.json for testing
	const tsconfigSpecJson = {
		extends: "../../config/ts/tsconfig.spec.json",
		compilerOptions: {
			outDir: "./dist-spec",
			rootDir: ".",
			types: ["mocha", "chai", "node"],
		},
		include: ["src/**/*.ts"],
		exclude: ["node_modules", "dist"],
	}

	fs.writeFileSync(
		path.join(projectRoot, "tsconfig.spec.json"),
		JSON.stringify(tsconfigSpecJson, null, 2),
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
# Build (TypeScript compilation)
pnpm nx build ${projectName}

# Build (Bundle with tsup)
pnpm nx bundle ${projectName}

# Build binary executables
pnpm nx pkg ${projectName}

# Test
pnpm nx test ${projectName}

# Test with coverage
pnpm nx coverage ${projectName}

# Lint
pnpm nx lint ${projectName}

# Type check
pnpm nx typecheck ${projectName}
\`\`\`

## Configuration

This package uses shared configurations from \`@sshield/config\`:

- **TypeScript**: Base and library configs
- **ESLint**: Linting rules
- **Prettier**: Code formatting
- **Mocha + Chai**: Testing framework
- **NYC**: Code coverage
- **TSup**: Bundling
- **pkg**: Binary building

## License

MIT
`

	fs.writeFileSync(path.join(projectRoot, "README.md"), readme)

	// Create tsup.config.ts
	const tsupConfig = `/** @format */
import { defineConfig } from "tsup"
import baseTsupConfig from "@sshield/config/tsup"

export default defineConfig({
	...baseTsupConfig,
	entry: ["src/index.ts"],
})
`

	fs.writeFileSync(path.join(projectRoot, "tsup.config.ts"), tsupConfig)

	// Create pkg.config.json
	const pkgConfigJson = {
		scripts: ["dist/**/*.js"],
		assets: ["package.json", "dist/**/*.json", "dist/**/*.md"],
		targets: [
			"node18-linux-x64",
			"node18-linux-arm64",
			"node18-macos-x64",
			"node18-macos-arm64",
			"node18-win-x64",
			"node18-win-arm64",
		],
		outputPath: "bin",
		compress: "Brotli",
	}

	fs.writeFileSync(
		path.join(projectRoot, "pkg.config.json"),
		JSON.stringify(pkgConfigJson, null, 2),
	)

	if (options.addTests) {
		// Create .mocharc.json with embedded configuration
		const mochaConfig = {
			extensions: ["ts"],
			spec: ["src/**/*.spec.ts", "src/**/*.test.ts"],
			recursive: true,
			timeout: 5000,
			reporter: "spec",
			color: true,
			exit: true,
			watchFiles: ["src/**/*.ts", "src/**/*.spec.ts", "src/**/*.test.ts"],
			bail: false,
			fullTrace: false,
			checkLeaks: false,
		}

		fs.writeFileSync(
			path.join(projectRoot, ".mocharc.json"),
			JSON.stringify(mochaConfig, null, 2),
		)

		// Create .nycrc.json for code coverage
		const nycConfig = {
			all: true,
			"check-coverage": true,
			lines: 90,
			functions: 90,
			branches: 90,
			statements: 90,
			include: ["src/**/*.ts"],
			exclude: [
				"**/*.spec.ts",
				"**/*.test.ts",
				"**/node_modules/**",
				"**/dist/**",
				"**/coverage/**",
			],
			extension: [".ts"],
			reporter: ["text", "lcov", "html"],
			"report-dir": "./coverage",
			"temp-dir": "./.nyc_output",
			require: ["ts-node/register"],
			sourceMap: true,
			instrument: true,
		}

		fs.writeFileSync(
			path.join(projectRoot, ".nycrc.json"),
			JSON.stringify(nycConfig, null, 2),
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
