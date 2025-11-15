/** @format */

/**
 * Base lefthook configuration for SSHield monorepo
 * Git hooks management - faster alternative to Husky
 */
interface LefthookConfig {
  "pre-commit"?: {
    parallel?: boolean;
    commands?: Record<
      string,
      {
        glob?: string;
        run?: string;
        skip?: string | string[];
        tags?: string;
        files?: string;
        exclud?: string;
        root?: string;
        interactive?: boolean;
      }
    >;
  };
  "commit-msg"?: {
    parallel?: boolean;
    commands?: Record<
      string,
      {
        run?: string;
        skip?: string | string[];
      }
    >;
  };
  "pre-push"?: {
    parallel?: boolean;
    commands?: Record<
      string,
      {
        run?: string;
        skip?: string | string[];
      }
    >;
  };
  "post-checkout"?: {
    parallel?: boolean;
    commands?: Record<
      string,
      {
        run?: string;
        skip?: string | string[];
      }
    >;
  };
  "post-merge"?: {
    parallel?: boolean;
    commands?: Record<
      string,
      {
        run?: string;
        skip?: string | string[];
      }
    >;
  };
}

const lefthookConfig: LefthookConfig = {
  // Pre-commit hook - run before commit is created
  "pre-commit": {
    parallel: true,
    commands: {
      // Lint staged files
      lint: {
        glob: "*.{js,ts,tsx,jsx}",
        run: "pnpm exec eslint --fix {staged_files}",
      },

      // Format staged files
      format: {
        glob: "*.{js,ts,tsx,jsx,json,md,yml,yaml}",
        run: "pnpm exec prettier --write {staged_files}",
      },

      // Type check
      typecheck: {
        run: "pnpm exec tsc --noEmit",
      },

      // Run affected tests
      test: {
        run: "pnpm exec nx affected --target=test --parallel=3",
        skip: "merge",
      },
    },
  },

  // Commit message hook - validate commit message
  "commit-msg": {
    parallel: false,
    commands: {
      commitlint: {
        run: "pnpm exec commitlint --edit {1}",
      },
    },
  },

  // Pre-push hook - run before pushing to remote
  "pre-push": {
    parallel: false,
    commands: {
      // Run all affected tests
      test: {
        run: "pnpm exec nx affected --target=test --parallel=3",
      },

      // Build affected projects
      build: {
        run: "pnpm exec nx affected --target=build --parallel=3",
      },

      // Run knip to check for unused dependencies
      knip: {
        run: "pnpm exec knip --no-exit-code",
        skip: "rebase",
      },
    },
  },

  // Post-checkout hook - run after checkout
  "post-checkout": {
    parallel: false,
    commands: {
      // Install dependencies if package.json or pnpm-lock.yaml changed
      install: {
        run: 'pnpm install --frozen-lockfile || echo "Skipping install - lockfile unchanged"',
      },
    },
  },

  // Post-merge hook - run after merge
  "post-merge": {
    parallel: false,
    commands: {
      // Install dependencies if package.json or pnpm-lock.yaml changed
      install: {
        run: 'pnpm install --frozen-lockfile || echo "Skipping install - lockfile unchanged"',
      },
    },
  },
};

export default lefthookConfig;
export type { LefthookConfig };
