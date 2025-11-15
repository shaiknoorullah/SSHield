#!/usr/bin/env node
/** @format */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * TypeDoc to Fuma-docs converter
 * Processes TypeDoc-generated Markdown files to be compatible with Fuma-docs
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_API_DIR = path.join(__dirname, "../../docs/content/docs/api")

interface FumaMeta {
	title: string
	description?: string
}

/**
 * Process a single Markdown file to add Fuma-docs frontmatter
 */
function processMarkdownFile(filePath: string): void {
	try {
		const content = fs.readFileSync(filePath, "utf-8")

		// Skip if already has frontmatter
		if (content.startsWith("---")) {
			console.log(`⏭️  Skipping ${path.basename(filePath)} (already processed)`)
			return
		}

		// Extract title from first heading
		const titleMatch = content.match(/^#\s+(.+)$/m)
		const title = titleMatch ? titleMatch[1] : path.basename(filePath, ".mdx")

		// Create frontmatter
		const frontmatter: FumaMeta = {
			title,
			description: `API documentation for ${title}`,
		}

		const frontmatterStr = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
---

`

		// Write updated content
		const updatedContent = frontmatterStr + content
		fs.writeFileSync(filePath, updatedContent, "utf-8")

		console.log(`✅ Processed ${path.basename(filePath)}`)
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error)
	}
}

/**
 * Recursively process all Markdown files in a directory
 */
function processDirectory(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		console.log(`📁 Directory ${dirPath} does not exist yet`)
		return
	}

	const entries = fs.readdirSync(dirPath, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)

		if (entry.isDirectory()) {
			processDirectory(fullPath)
		} else if (
			entry.isFile() &&
			(entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
		) {
			processMarkdownFile(fullPath)
		}
	}
}

/**
 * Create meta.json files for Fuma-docs navigation
 */
function createMetaFiles(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		return
	}

	const entries = fs.readdirSync(dirPath, { withFileTypes: true })
	const pages: string[] = []

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)

		if (entry.isDirectory()) {
			pages.push(entry.name)
			createMetaFiles(fullPath) // Recursively create meta files
		} else if (entry.isFile() && entry.name.endsWith(".mdx")) {
			const pageName = path.basename(entry.name, ".mdx")
			if (pageName !== "index") {
				pages.push(pageName)
			}
		}
	}

	if (pages.length > 0) {
		const metaPath = path.join(dirPath, "meta.json")
		const meta = {
			pages: pages.sort(),
		}
		fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8")
		console.log(`📝 Created ${metaPath}`)
	}
}

/**
 * Main function
 */
function main() {
	console.log("🚀 Starting TypeDoc to Fuma-docs conversion...")
	console.log(`📂 Processing directory: ${DOCS_API_DIR}`)

	// Process all Markdown files
	processDirectory(DOCS_API_DIR)

	// Create meta.json files for navigation
	console.log("\n📋 Creating meta.json files...")
	createMetaFiles(DOCS_API_DIR)

	console.log("\n✨ Conversion complete!")
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}

export { processMarkdownFile, processDirectory, createMetaFiles }
