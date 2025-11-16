# SSHield Package Scaffolder

A script to quickly scaffold new packages in the SSHield monorepo with proper @sshield/config integration.

## Usage

```bash
pnpm scaffold <package-name> [options]
```

### Options

- `--directory, -d <dir>`: Directory where the package should be created (`packages` or `plugins`) [default: `packages`]
- `--description <desc>`: Package description
- `--no-tests`: Skip test setup (Mocha configuration will not be created)

### Examples

```bash
# Create a new package in packages/
pnpm scaffold my-package --description "My awesome package"

# Create a new plugin
pnpm scaffold my-plugin --directory plugins --description "My plugin"

# Create a package without tests
pnpm scaffold utils --description "Utility functions" --no-tests
```

## What Gets Created

The scaffolder creates a complete package structure with:

### Files

- `package.json` - Package manifest with @sshield/config dependency
- `project.json` - Nx project configuration
- `tsconfig.json` - TypeScript config extending @sshield/config/ts/base
- `tsconfig.lib.json` - Library-specific TypeScript config
- `eslint.config.mjs` - ESLint config using @sshield/config
- `.prettierrc.json` - Prettier config extending @sshield/config
- `README.md` - Package documentation template
- `src/index.ts` - Main entry point with example code
- `.mocharc.json` - Mocha test configuration (if --no-tests not specified)
- `src/index.spec.ts` - Example test file (if --no-tests not specified)

### Configuration Integration

All scaffolded packages automatically use configurations from `@sshield/config`:

- **TypeScript**: Extends base and lib configs for consistent compilation settings
- **ESLint**: Uses shared ESLint configuration
- **Prettier**: Uses shared code formatting rules
- **Mocha**: Uses shared test framework configuration
- **NYC**: Coverage configuration (when used)

### Nx Integration

Packages are automatically:

- Discovered by Nx
- Added to the project graph
- Configured with build, lint, typecheck, and test targets
- Set up with proper caching

## After Scaffolding

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the package:
   ```bash
   pnpm nx build @sshield/<package-name>
   ```

3. Run tests:
   ```bash
   pnpm nx test @sshield/<package-name>
   ```

4. Lint the code:
   ```bash
   pnpm nx lint @sshield/<package-name>
   ```

## Package Naming

- Package names are automatically converted to kebab-case
- The full package name will be `@sshield/<your-package-name>`
- Use descriptive, lowercase names with hyphens

## Directory Structure

```
packages/<package-name>/
├── src/
│   ├── index.ts
│   └── index.spec.ts (if tests enabled)
├── package.json
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
├── eslint.config.mjs
├── .prettierrc.json
├── .mocharc.json (if tests enabled)
└── README.md
```

## Customization

After scaffolding, you can customize:

- Add more dependencies to `package.json`
- Extend build configuration in `project.json`
- Add custom TypeScript compiler options (extends will merge)
- Add project-specific ESLint rules
- Modify test configuration

All customizations will inherit base configurations from `@sshield/config`.
