/** @format */

// Temporary minimal ESLint config until dependencies are installed
// Run `pnpm install` then replace this with the full config

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/.nx/**",
      "**/bin/**",
    ],
  },
];
