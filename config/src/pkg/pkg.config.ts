/** @format */

/**
 * pkg configuration for building standalone binaries
 * @see https://github.com/vercel/pkg
 */
interface PkgConfig {
	scripts?: string[]
	assets?: string[]
	targets?: string[]
	outputPath?: string
	compress?: "Brotli" | "GZip" | "None"
}

const pkgConfig: PkgConfig = {
	// Scripts to include in the binary
	scripts: ["dist/**/*.js"],

	// Assets to include (configs, templates, etc.)
	assets: [
		"package.json",
		"dist/**/*.json",
		"dist/**/*.md",
	],

	// Target platforms and Node versions
	// Format: node<version>-<platform>-<arch>
	targets: [
		"node18-linux-x64",
		"node18-linux-arm64",
		"node18-macos-x64",
		"node18-macos-arm64",
		"node18-win-x64",
		"node18-win-arm64",
	],

	// Compression
	compress: "Brotli",
}

export default pkgConfig
