/** @format */

// Testing
export * from "./mocha/.mocharc.js";
export * from "./testing/ink-helpers.js";

// Linting and Formatting
export * from "./eslint/eslint.config.js";
export * from "./prettier/prettier.config.js";

// Code Coverage
export * from "./c8/c8.config.js";

// Build and Bundle
export * from "./tsup/tsup.config.js";
export * from "./pkg/pkg.config.js";

// Documentation
export * from "./typedoc/typedoc.config.js";

// Git and Commits
export * from "./commitlint/commitlint.config.js";
export * from "./lefthook/lefthook.config.js";

// Release Management
export * from "./release-it/release-it.config.js";

// Code Quality
export * from "./knip/knip.config.js";

// Development Tools
export * from "./devtools/devtools.config.js";

// Package Distribution
export * from "./nfpm/nfpm.config.js";
export * from "./aur/pkgbuild.config.js";
