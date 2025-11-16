# @sshield/example-cli

Example CLI application demonstrating the complete SSHield monorepo tooling setup.

## Features

This package demonstrates all the tooling configured in the SSHield monorepo:

- **TypeScript** with strict mode compilation
- **Ink** for React-based CLI UIs
- **Commander.js** for CLI argument parsing
- **Chalk** for terminal colors
- **Mocha + Chai** for unit testing
- **ink-testing-library** for component testing
- **c8** for code coverage
- **tsup** for bundling
- **@yao-pkg/pkg** for standalone binary creation
- **TypeDoc** for API documentation generation
- **release-it** for release automation
- **nfpm** for package creation (.deb, .rpm, .apk)
- **ESLint** for linting
- **Prettier** for code formatting

## Installation

```bash
pnpm add @sshield/example-cli
```

## Usage

### CLI Commands

```bash
# Simple greeting
example-cli greet --name Alice

# Interactive Ink UI
example-cli greet --name Alice --interactive

# Show package information
example-cli info

# Show version
example-cli --version

# Show help
example-cli --help
```

### Programmatic API

```typescript
import { formatMessage, capitalize, createBanner } from "@sshield/example-cli";

// Format a greeting message
const message = formatMessage("World");
console.log(message); // "Hello, World! 👋"

// Capitalize a string
const capitalized = capitalize("hello");
console.log(capitalized); // "Hello"

// Create a banner
const banner = createBanner("Welcome");
console.log(banner);
// =============
//   Welcome
// =============
```

## Development

### Build

```bash
# Build the package
pnpm nx build @sshield/example-cli

# Build in watch mode
pnpm nx dev @sshield/example-cli
```

### Testing

```bash
# Run tests
pnpm nx test @sshield/example-cli

# Run tests with coverage
pnpm nx coverage @sshield/example-cli

# Run tests in watch mode
pnpm nx test:watch @sshield/example-cli
```

### Linting and Formatting

```bash
# Lint the code
pnpm nx lint @sshield/example-cli

# Format the code
pnpm nx format @sshield/example-cli
```

### Documentation

```bash
# Generate API documentation
pnpm nx docs @sshield/example-cli
```

### Bundling

```bash
# Create optimized bundle
pnpm nx bundle @sshield/example-cli
```

### Binary Creation

```bash
# Create standalone binaries for all platforms
pnpm nx pkg @sshield/example-cli
```

### Package Creation

```bash
# Create .deb, .rpm, and .apk packages
pnpm nx package @sshield/example-cli
```

### Release

```bash
# Create a new release
pnpm nx release @sshield/example-cli
```

## Project Structure

```
example-cli/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── index.ts            # Public API exports
│   ├── components/
│   │   ├── App.tsx         # Ink React component
│   │   └── App.test.tsx    # Component tests
│   └── utils/
│       ├── formatter.ts     # Utility functions
│       └── formatter.spec.ts # Unit tests
├── dist/                    # Compiled output
├── coverage/                # Test coverage reports
├── docs/                    # Generated API documentation
├── bundle/                  # Bundled output
├── bin/                     # Standalone binaries
└── pkg/                     # Distribution packages
```

## Testing Strategy

### Unit Tests

Unit tests are written using Mocha and Chai. They test individual functions in isolation:

- `formatter.spec.ts`: Tests for utility functions like `formatMessage`, `capitalize`, and `createBanner`

### Component Tests

Component tests use `ink-testing-library` to test React components:

- `App.test.tsx`: Tests for the Ink React component, including rendering and state updates

### Coverage

Code coverage is measured using c8 (V8 coverage). Aim for at least 80% coverage across all metrics.

## Build Outputs

### Compiled Output (`dist/`)

TypeScript files compiled to JavaScript with type declarations:

- `*.js` - Compiled JavaScript (CommonJS)
- `*.d.ts` - TypeScript type declarations
- `*.map` - Source maps for debugging

### Bundled Output (`bundle/`)

Optimized bundle created by tsup:

- Single-file bundle with tree-shaking
- Minified for production
- Ready for distribution

### Binaries (`bin/`)

Standalone executables created by @yao-pkg/pkg:

- `example-cli-linux` - Linux binary
- `example-cli-macos` - macOS binary
- `example-cli-win.exe` - Windows binary

### Packages (`pkg/`)

Distribution packages created by nfpm:

- `*.deb` - Debian/Ubuntu package
- `*.rpm` - RedHat/Fedora package
- `*.apk` - Alpine Linux package

## Configuration Files

- `project.json` - NX project configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.lib.json` - TypeScript library configuration
- `tsconfig.spec.json` - TypeScript test configuration
- `tsup.config.ts` - tsup bundler configuration
- `pkg.config.json` - @yao-pkg/pkg binary configuration
- `nfpm.yaml` - nfpm package configuration
- `.release-it.json` - release-it configuration

## License

MIT
