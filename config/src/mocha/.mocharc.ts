/** @format */

const mochaConfig = {
	require: ["ts-node/register", "source-map-support/register"],
	extensions: ["ts"],
	spec: ["src/**/*.spec.ts"],
	recursive: true,
	timeout: 5000,
	reporter: "spec",
	color: true,
	exit: true,
	"node-option": ["loader=ts-node/esm"],
	"ts-node": {
		project: "tsconfig.spec.json",
	},
	watchFiles: ["src/**/*.ts", "src/**/*.spec.ts"],
}

export default mochaConfig
