/** @format */

/**
 * Base release-it configuration for SSHield packages
 * Handles versioning, changelog, and publishing in monorepo
 */
interface ReleaseItConfig {
  git?: {
    commit?: boolean;
    tag?: boolean;
    push?: boolean;
    commitMessage?: string;
    tagName?: string;
    requireBranch?: string | string[];
    requireCleanWorkingDir?: boolean;
    requireUpstream?: boolean;
    addUntrackedFiles?: boolean;
  };
  npm?: {
    publish?: boolean;
    publishPath?: string;
    skipChecks?: boolean;
    ignoreVersion?: boolean;
  };
  github?: {
    release?: boolean;
    releaseName?: string;
    draft?: boolean;
    preRelease?: boolean;
    assets?: string[];
    releaseNotes?: string;
  };
  gitlab?: {
    release?: boolean;
  };
  plugins?: Record<string, any>;
  hooks?: {
    "before:init"?: string | string[];
    "after:bump"?: string | string[];
    "after:release"?: string | string[];
  };
}

const releaseItConfig: ReleaseItConfig = {
  git: {
    commit: true,
    tag: true,
    push: true,
    commitMessage: "release: ${name}@${version}",
    tagName: "${name}@${version}",
    requireCleanWorkingDir: false, // Allow release with uncommitted changes
    requireUpstream: true,
    addUntrackedFiles: false,
  },

  npm: {
    publish: true,
    publishPath: ".",
    skipChecks: false,
    ignoreVersion: false,
  },

  github: {
    release: true, // Enable GitHub releases
    releaseName: "${name} v${version}",
    draft: false,
    preRelease: false,
    // Assets to upload to GitHub releases
    // Customize this per package to include binaries
    assets: [
      "dist/*.tar.gz",
      "dist/*.deb",
      "dist/*.rpm",
      "dist/*-linux-*",
      "dist/*-macos-*",
      "dist/*-win-*.exe",
    ],
  },

  gitlab: {
    release: false,
  },

  plugins: {
    "@release-it/conventional-changelog": {
      preset: {
        name: "conventionalcommits",
        types: [
          { type: "feat", section: "Features" },
          { type: "fix", section: "Bug Fixes" },
          { type: "perf", section: "Performance Improvements" },
          { type: "revert", section: "Reverts" },
          { type: "docs", section: "Documentation" },
          { type: "style", section: "Styles" },
          { type: "refactor", section: "Code Refactoring" },
          { type: "test", section: "Tests" },
          { type: "build", section: "Build System" },
          { type: "ci", section: "CI" },
          { type: "maintenance", section: "Maintenance" },
          { type: "init", section: "Initialization" },
          { type: "chore", hidden: true },
        ],
      },
      infile: "CHANGELOG.md",
      header: "# Changelog",
      gitRawCommitsOpts: {
        path: ".",
      },
    },
  },

  hooks: {
    "before:init": ["pnpm run build", "pnpm run test"],
    "after:bump": [
      "echo Successfully bumped version to ${version}",
      // Build binaries with pkg
      "pnpm run bundle",
      // Package binaries with nfpm (if available)
      "pnpm run package || true",
    ],
    "after:release": [
      "echo Successfully released ${name}@${version} to ${repo.repository}",
      // Clean up build artifacts
      "rimraf dist/*.tar.gz dist/*.deb dist/*.rpm",
    ],
  },
};

export default releaseItConfig;
