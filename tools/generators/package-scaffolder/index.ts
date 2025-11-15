/** @format */
import {
	formatFiles,
	generateFiles,
	names,
	offsetFromRoot,
	Tree,
} from "@nx/devkit"
import * as path from "path"

interface PackageScaffolderSchema {
	name: string
	description: string
	directory: "packages" | "plugins"
	bundler: "rollup" | "tsup" | "tsc"
	addTests: boolean
}

export default async function (tree: Tree, options: PackageScaffolderSchema) {
	const normalizedOptions = normalizeOptions(tree, options)
	addFiles(tree, normalizedOptions)
	await formatFiles(tree)
}

function normalizeOptions(_tree: Tree, options: PackageScaffolderSchema) {
	const name = names(options.name).fileName
	const projectDirectory = options.directory || "packages"
	const projectName = `@sshield/${name}`
	const projectRoot = `${projectDirectory}/${name}`
	const parsedTags: string[] = []

	return {
		...options,
		projectName,
		projectRoot,
		projectDirectory,
		parsedTags,
		name,
		offset: offsetFromRoot(projectRoot),
	}
}

function addFiles(tree: Tree, options: ReturnType<typeof normalizeOptions>) {
	const templateOptions = {
		...options,
		...names(options.name),
		offsetFromRoot: offsetFromRoot(options.projectRoot),
		template: "",
	}

	generateFiles(
		tree,
		path.join(__dirname, "files"),
		options.projectRoot,
		templateOptions,
	)
}
