# Packaging Guide for example-cli

This document describes the various packaging and distribution methods available for the example-cli package.

## ⚠️ Important Notice

**The `bundle` and `pkg` binary targets DO NOT WORK with Ink-based CLIs** due to React's use of top-level await in ESM modules. These targets will fail with the error: "Module format 'cjs' does not support top-level await."

**Working Targets:**
- ✅ `pnpm build` - TypeScript compilation
- ✅ `pnpm test` - Run tests
- ✅ `pnpm typecheck` - Type checking
- ✅ `pnpm test:coverage` - Coverage reports
- ✅ `pnpm build:package` - System packages (.deb, .rpm, .apk, PKGBUILD)

**Non-Working Targets (Ink Limitation):**
- ❌ `pnpm build:bundle` - Fails due to top-level await
- ❌ `pnpm build:binary` - Depends on bundle, also fails

## Table of Contents

- [Testing & Coverage](#testing--coverage)
- [System Packages with nfpm](#system-packages-with-nfpm)
- [Binary Packaging Alternatives](#binary-packaging-alternatives)
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

## Binary Packaging Alternatives

Since `pkg` does not work with Ink-based CLIs due to top-level await limitations, here are the recommended alternatives:

### Option 1: NPM Distribution (Recommended)

The simplest and most effective way to distribute the CLI:

```bash
# Install globally from npm
npm install -g @sshield/example-cli

# Or run directly with npx
npx @sshield/example-cli hello --name "World"
```

**Pros:**
- Works perfectly with Ink/React
- Automatic dependency management
- Easy updates via npm
- Cross-platform support

**Cons:**
- Requires Node.js installed on target system

### Option 2: System Packages (nfpm)

Create native packages for Linux distributions (see below for details):

```bash
pnpm build:package
```

This generates:
- `.deb` for Debian/Ubuntu
- `.rpm` for Fedora/RHEL/SUSE
- `.apk` for Alpine Linux
- `PKGBUILD` for Arch Linux

### Option 3: Docker Container

Package the CLI in a Docker container:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENTRYPOINT ["node", "dist/src/cli.js"]
```

**Why pkg Doesn't Work**:
- Ink uses React with top-level await
- CommonJS format (required by pkg) doesn't support top-level await
- Attempting to bundle results in: `RollupError: Module format "cjs" does not support top-level await`

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
# Build all packages (recommended - uses package-dist.mjs)
pnpm build:package

# The script generates:
# - nfpm.yaml (package configuration)
# - PKGBUILD (Arch Linux source)
# - PKGBUILD.bin (Arch Linux binary)
# - Builds .deb, .rpm, and .apk packages if nfpm is installed
```

### Output

Packages are created in the current directory:

- `example-cli_1.0.0_amd64.deb` (Debian/Ubuntu)
- `example-cli-1.0.0-1.x86_64.rpm` (RHEL/Fedora/SUSE)
- `example-cli_1.0.0_x86_64.apk` (Alpine Linux)
- `PKGBUILD` (Arch Linux source)
- `PKGBUILD.bin` (Arch Linux binary)

**Note**: The generated `nfpm.yaml` expects a binary at `./dist/example-cli`. For Node.js CLIs, you may need to customize this to install the full application directory instead.

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
- ✅ Use `pnpm test` and `pnpm test:coverage` for local development
- ✅ Run the CLI directly with `node dist/src/cli.js` (after `pnpm build`)
- ✅ Use `pnpm typecheck` before committing

### For Distribution

| Method | Status | Best For | Limitations |
|--------|--------|----------|-------------|
| **npm/npx** | ✅ **Works** | All users, simplest method | Requires Node.js 18+ |
| **System Packages** | ✅ **Works** | Linux production servers | Platform-specific |
| **Docker** | ✅ **Works** | Containerized deployments | Requires Docker |
| **pkg Binaries** | ❌ **Broken** | N/A - Doesn't work with Ink | Top-level await incompatibility |
| **tsup Bundle** | ❌ **Broken** | N/A - Doesn't work with Ink | Top-level await incompatibility |

### Recommended Approach for Production

For this Ink-based CLI:

1. **Primary (Recommended)**: Distribute via npm registry
   ```bash
   # Install globally
   npm install -g @sshield/example-cli

   # Or use without installing
   npx @sshield/example-cli hello --name "World"
   ```
   - ✅ Simplest for users
   - ✅ Cross-platform
   - ✅ Automatic updates
   - ✅ Works perfectly with Ink/React

2. **Alternative**: System packages for enterprise Linux
   ```bash
   pnpm build:package
   sudo dpkg -i example-cli_1.0.0_amd64.deb
   ```
   - ✅ Native package manager integration
   - ✅ System-wide installation
   - ⚠️ Requires customization for Node.js CLIs

3. **Development**: Direct execution from repository
   ```bash
   pnpm install
   pnpm build
   node dist/src/cli.js hello
   ```

### Why Not Standalone Binaries?

Ink-based CLIs cannot be packaged with `pkg` or similar tools because:
- React/Ink uses ESM with top-level await
- CommonJS bundling (required by pkg) doesn't support top-level await
- Attempting to bundle fails with rollup errors

For standalone binaries, consider:
- Rewriting the CLI without Ink (use a different terminal UI library)
- Or accept that npm/system packages are the distribution methods

## Additional Resources

- [pkg Documentation](https://github.com/yao-pkg/pkg)
- [nfpm Documentation](https://nfpm.goreleaser.com/)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Commander.js Documentation](https://github.com/tj/commander.js)
