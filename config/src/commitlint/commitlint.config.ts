/** @format */

import type { UserConfig } from "@commitlint/types";

/**
 * Base commitlint configuration for SSHield monorepo
 * Enforces conventional commits with strict rules
 */
const commitlintConfig: UserConfig = {
  extends: ["@commitlint/config-conventional"],

  // Strict rules for commit messages
  rules: {
    // Type must be one of these
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Changes that don't affect code meaning
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Performance improvement
        "test", // Adding or updating tests
        "build", // Changes to build system or dependencies
        "ci", // Changes to CI configuration
        "chore", // Other changes that don't modify src or test files
        "maintenance", // Maintenance tasks
        "init", // Initialize a new plugin or package
        "revert", // Reverts a previous commit
        "release", // Release commits
      ],
    ],

    // Scope must be one of these (optional)
    "scope-enum": [
      2,
      "always",
      [
        "config",
        "core",
        "cli",
        "api",
        "ui",
        "docs",
        "deps",
        "test",
        "ci",
        "build",
        "release",
      ],
    ],

    // Scope is optional but recommended
    "scope-empty": [1, "never"],

    // Subject must not be empty
    "subject-empty": [2, "never"],

    // Subject must not end with period
    "subject-full-stop": [2, "never", "."],

    // Subject must be lowercase
    "subject-case": [2, "always", "lower-case"],

    // Header must not be longer than 100 characters
    "header-max-length": [2, "always", 100],

    // Body must have blank line after header
    "body-leading-blank": [2, "always"],

    // Footer must have blank line before it
    "footer-leading-blank": [2, "always"],

    // Type must be lowercase
    "type-case": [2, "always", "lower-case"],

    // Type must not be empty
    "type-empty": [2, "never"],

    // Scope must be lowercase
    "scope-case": [2, "always", "lower-case"],
  },

  // Help URL for commit message format
  helpUrl:
    "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",

  // Prompt configuration
  prompt: {
    messages: {
      skip: ":skip",
      max: "upper %d chars",
      min: "%d chars at least",
      emptyWarning: "can not be empty",
      upperLimitWarning: "over limit",
      lowerLimitWarning: "below limit",
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: "A new feature",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "A bug fix",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          docs: {
            description: "Documentation only changes",
            title: "Documentation",
            emoji: "📚",
          },
          style: {
            description:
              "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
            title: "Styles",
            emoji: "💎",
          },
          refactor: {
            description:
              "A code change that neither fixes a bug nor adds a feature",
            title: "Code Refactoring",
            emoji: "📦",
          },
          perf: {
            description: "A code change that improves performance",
            title: "Performance Improvements",
            emoji: "🚀",
          },
          test: {
            description: "Adding missing tests or correcting existing tests",
            title: "Tests",
            emoji: "🚨",
          },
          build: {
            description:
              "Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)",
            title: "Builds",
            emoji: "🛠",
          },
          ci: {
            description:
              "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)",
            title: "Continuous Integrations",
            emoji: "⚙️",
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: "Chores",
            emoji: "♻️",
          },
          maintenance: {
            description:
              "Maintenance tasks that do not modify src or test files",
            title: "Maintenance",
            emoji: "🔧",
          },
          init: {
            description: "Initialize a new plugin or package",
            title: "Initialization",
            emoji: "🎉",
          },
          revert: {
            description: "Reverts a previous commit",
            title: "Reverts",
            emoji: "🗑",
          },
        },
      },
      scope: {
        description:
          "What is the scope of this change (e.g. component or file name)",
      },
      subject: {
        description:
          "Write a short, imperative tense description of the change",
      },
      body: {
        description: "Provide a longer description of the change",
      },
      isBreaking: {
        description: "Are there any breaking changes?",
      },
      breakingBody: {
        description:
          "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
      },
      breaking: {
        description: "Describe the breaking changes",
      },
      isIssueAffected: {
        description: "Does this change affect any open issues?",
      },
      issuesBody: {
        description:
          "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};

export default commitlintConfig;
export type { UserConfig };
