/** @format */

module.exports = {
	require: ["ts-node/register", "tsconfig-paths/register"],
	extensions: ["ts"],
	spec: ["src/**/*.spec.ts"],
	recursive: true,
	ui: "bdd",
	parallel: true,
	timeout: 5000,
	reporter: "spec",
	color: true,
	exit: true,
	"ts-node": {
		project: "./tsconfig.spec.json",
		transpileOnly: true,
	},
	watchFiles: ["src/**/*.ts", "src/**/*.spec.ts"],
}
