# Packaging Guide for example-cli

This document describes the various packaging and distribution methods available for the example-cli package.

## Table of Contents

- [Testing & Coverage](#testing--coverage)
- [Binary Packaging with pkg](#binary-packaging-with-pkg)
- [System Packages with nfpm](#system-packages-with-nfpm)
- [Requirements](#requirements)
- [Known Limitations](#known-limitations)

## Testing & Coverage

### Running Tests

```bash
# Run all tests
pnpm nx test @sshield/example-cli

# Run tests with coverage
pnpm nx coverage @sshield/example-cli
```

### Coverage Reports

Code coverage is generated using `c8` with the following outputs:

- **HTML Report**: `packages/example-cli/coverage/index.html`
- **LCOV Report**: `packages/example-cli/coverage/lcov.info`
- **JSON Summary**: `packages/example-cli/coverage/coverage-summary.json`

**Coverage Thresholds**:
- Lines: 65%
- Functions: 65%
- Branches: 75%
- Statements: 65%

Current coverage focuses on testable utilities and components. CLI entry points and command handlers would typically be covered by integration tests rather than unit tests.

## Binary Packaging with pkg

The `@yao-pkg/pkg` tool can create standalone executables for multiple platforms.

### Building Binaries

```bash
# Build all platform binaries
pnpm nx pkg @sshield/example-cli
```

### Output

Binaries are created in `packages/example-cli/bin/`:

- `example-cli-linux-x64` (~50MB)
- `example-cli-linux-arm64` (~48MB)
- `example-cli-macos-x64` (~54MB)
- `example-cli-macos-arm64` (~48MB)
- `example-cli-win-x64.exe` (~42MB)
- `example-cli-win-arm64.exe` (~29MB)

### Known Limitations

**Important**: The current implementation has limitations when using `pkg` with Ink-based CLIs:

1. **ESM + Ink Compatibility**: Ink uses React with top-level await, which conflicts with CommonJS bundling required by pkg
2. **Bytecode Compilation**: Most modules cannot be compiled to bytecode and are included as JavaScript
3. **macOS Code Signing**: Binaries must be signed before distribution on macOS

**Recommended Alternatives**:
- For simpler CLIs without Ink: pkg works well
- For Ink-based CLIs: Consider distributing via npm, or using system packages (see below)
- For production: Use Docker containers or system packages

### Configuration

See `packages/example-cli/pkg.config.json` for pkg configuration.

## System Packages with nfpm

nfpm creates native packages (.deb, .rpm) for Linux distributions.

### Prerequisites

Install nfpm:

```bash
# On macOS
brew install nfpm

# On Linux (using go)
go install github.com/goreleaser/nfpm/v2/cmd/nfpm@latest

# Using Docker
docker pull goreleaser/nfpm
```

### Building Packages

```bash
# Build Debian package
pnpm nx nfpm:deb @sshield/example-cli

# Build RPM package
pnpm nx nfpm:rpm @sshield/example-cli

# Build both
pnpm nx nfpm:all @sshield/example-cli
```

### Output

Packages are created in `packages/example-cli/dist-packages/`:

- `sshield-example-cli_1.0.0_amd64.deb` (Debian/Ubuntu)
- `sshield-example-cli-1.0.0.x86_64.rpm` (RHEL/Fedora/SUSE)

### Package Installation

```bash
# Debian/Ubuntu
sudo dpkg -i sshield-example-cli_1.0.0_amd64.deb
sudo apt-get install -f  # Install dependencies

# RHEL/Fedora
sudo rpm -i sshield-example-cli-1.0.0.x86_64.rpm
```

### Package Contents

- **Application**: `/usr/lib/sshield-example-cli/`
- **Executable**: `/usr/bin/example-cli`
- **Dependencies**: Automatically installs production dependencies during post-install

### Usage After Installation

```bash
# From anywhere in the system
example-cli hello --name "System Package"
example-cli --help
```

### Configuration

See `packages/example-cli/nfpm.yaml` for package configuration.

## Requirements

### For Development

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- TypeScript >= 5.0.0

### For Testing

- Mocha (ts-mocha for TypeScript)
- Chai (assertions)
- c8 (coverage)
- ink-testing-library (Ink component testing)

### For Binary Packaging

- @yao-pkg/pkg (installed as devDependency)
- Node.js build toolchain

### For System Packaging

- nfpm (must be installed separately)
- rpm tools (for .rpm packages)
- dpkg tools (for .deb packages)

## Known Limitations

### pkg Limitations

1. **Ink/React Limitations**: Complex React-based terminal UIs may not bundle correctly due to:
   - Top-level await in ESM modules
   - Dynamic imports
   - Complex dependency trees

2. **Bundle Size**: Binaries are large (30-50MB) because they include:
   - Complete Node.js runtime
   - All dependencies
   - Application code

3. **Platform Support**:
   - macOS binaries require code signing
   - Some native modules may not work in all environments

### nfpm Considerations

1. **Node.js Dependency**: System packages require Node.js to be pre-installed on the target system
2. **npm Installation**: Post-install script runs `npm install --production`, which requires internet connectivity
3. **Platform Specific**: Must build separate packages for each target distribution

## Recommendations

### For Development & Testing
- Use `pnpm nx test` and `pnpm nx coverage` for local development
- Run the CLI directly with `node packages/example-cli/dist/src/cli.js`

### For Distribution

| Method | Best For | Limitations |
|--------|----------|-------------|
| **npm** | JavaScript/Node.js developers | Requires Node.js installed |
| **System Packages** | Linux servers/workstations | Platform-specific, requires nfpm |
| **Docker** | Containerized deployments | Requires Docker runtime |
| **pkg Binaries** | Simple CLIs without Ink | Large file size, Ink incompatibility |

### Recommended Approach for Production

For this Ink-based CLI, we recommend:

1. **Primary**: Distribute via npm registry
   ```bash
   npm install -g @sshield/example-cli
   ```

2. **Alternative**: System packages (deb/rpm) for enterprise Linux deployments

3. **Development**: Direct execution from repository
   ```bash
   pnpm install
   pnpm nx build @sshield/example-cli
   node packages/example-cli/dist/src/cli.js hello
   ```

## Additional Resources

- [pkg Documentation](https://github.com/yao-pkg/pkg)
- [nfpm Documentation](https://nfpm.goreleaser.com/)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Commander.js Documentation](https://github.com/tj/commander.js)
