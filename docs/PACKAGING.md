# Package Distribution Guide

This guide explains how to build and distribute SSHield packages across different package managers and platforms.

## Overview

SSHield supports distribution through multiple channels:

- **npm** - Node.js package registry
- **GitHub Releases** - Binary downloads for all platforms
- **Arch Linux AUR** - pacman/yay/paru (via PKGBUILD)
- **Debian/Ubuntu** - apt (via .deb packages)
- **Fedora/RHEL** - dnf/yum (via .rpm packages)
- **Alpine Linux** - apk (via .apk packages)
- **Direct Download** - Standalone binaries (Linux, macOS, Windows)

## Quick Start

### Build Everything

```bash
# Build TypeScript code
pnpm run build

# Build standalone binaries
pnpm run build:binary

# Create distribution packages (.deb, .rpm, .apk, PKGBUILD)
pnpm run build:package
```

### Release

```bash
# Create a new release (builds, tests, packages, and publishes)
pnpm run release
```

## Tools

### @yao-pkg/pkg
Creates standalone binaries for multiple platforms from Node.js applications.

**Configuration**: `config/src/pkg/pkg.config.ts`

**Supported platforms**:
- Linux: x64, arm64, Alpine (musl)
- macOS: x64, arm64
- Windows: x64, arm64

**Usage**:
```bash
pnpm run build:binary
```

### nfpm
Creates .deb, .rpm, and .apk packages from a single configuration file.

**Configuration**: `config/src/nfpm/nfpm.config.ts`

**Installation**:
```bash
# macOS
brew install nfpm

# Linux (Arch)
yay -S nfpm-bin

# Linux (Debian/Ubuntu)
echo 'deb [trusted=yes] https://repo.goreleaser.com/apt/ /' | sudo tee /etc/apt/sources.list.d/goreleaser.list
sudo apt update
sudo apt install nfpm

# Docker
docker pull goreleaser/nfpm
```

**Usage**:
```bash
# Generate nfpm.yaml and build packages
node tools/scripts/package-dist.mjs
```

### release-it
Automates the release process including versioning, changelog generation, and publishing.

**Configuration**: `config/src/release-it/release-it.config.ts`

**Features**:
- Conventional commit changelog generation
- Git tagging and pushing
- npm publishing
- GitHub releases with binary uploads
- Automatic version bumping

**Usage**:
```bash
pnpm run release
```

## Package Types

### npm Package

Published to npm registry for Node.js users.

**Install**:
```bash
npm install -g @sshield/core
# or
pnpm add @sshield/core
```

### Standalone Binaries

Pre-built binaries for each platform, no Node.js required.

**Download from GitHub Releases**:
- `sshield-linux-x64`
- `sshield-linux-arm64`
- `sshield-macos-x64`
- `sshield-macos-arm64`
- `sshield-win-x64.exe`
- `sshield-win-arm64.exe`

**Install**:
```bash
# Linux/macOS
chmod +x sshield-linux-x64
sudo mv sshield-linux-x64 /usr/local/bin/sshield

# Windows
# Move sshield-win-x64.exe to a directory in your PATH
```

### Debian/Ubuntu (.deb)

For Debian, Ubuntu, and derivatives.

**Install from .deb**:
```bash
# Download from GitHub Releases
curl -LO https://github.com/shaiknoorullah/sshield/releases/download/v1.0.0/sshield_1.0.0_amd64.deb

# Install
sudo dpkg -i sshield_1.0.0_amd64.deb

# Or use apt
sudo apt install ./sshield_1.0.0_amd64.deb
```

**Build .deb**:
```bash
pnpm run build:package
# Output: dist/*.deb
```

### Fedora/RHEL (.rpm)

For Fedora, RHEL, CentOS, and derivatives.

**Install from .rpm**:
```bash
# Download from GitHub Releases
curl -LO https://github.com/shaiknoorullah/sshield/releases/download/v1.0.0/sshield-1.0.0.x86_64.rpm

# Install
sudo dnf install sshield-1.0.0.x86_64.rpm

# Or use rpm
sudo rpm -i sshield-1.0.0.x86_64.rpm
```

**Build .rpm**:
```bash
pnpm run build:package
# Output: dist/*.rpm
```

### Alpine Linux (.apk)

For Alpine Linux and derivatives.

**Install from .apk**:
```bash
# Download from GitHub Releases
curl -LO https://github.com/shaiknoorullah/sshield/releases/download/v1.0.0/sshield_1.0.0_x86_64.apk

# Install
sudo apk add --allow-untrusted sshield_1.0.0_x86_64.apk
```

**Build .apk**:
```bash
pnpm run build:package
# Output: dist/*.apk
```

### Arch Linux AUR

For Arch Linux and derivatives (via AUR).

**PKGBUILD Files**:
- `PKGBUILD` - Source package (builds from source)
- `PKGBUILD.bin` - Binary package (uses pre-built binaries)

**Install from AUR** (once published):
```bash
# Using yay
yay -S sshield

# Using paru
paru -S sshield

# Using plain makepkg
git clone https://aur.archlinux.org/sshield.git
cd sshield
makepkg -si
```

**Submit to AUR**:
1. Generate PKGBUILD:
   ```bash
   pnpm run build:package
   ```

2. Update checksums:
   ```bash
   cd dist
   makepkg --printsrcinfo > .SRCINFO
   ```

3. Submit to AUR:
   ```bash
   # Clone AUR repository
   git clone ssh://aur@aur.archlinux.org/sshield.git aur-sshield
   cd aur-sshield

   # Copy files
   cp ../PKGBUILD .
   cp ../.SRCINFO .

   # Commit and push
   git add PKGBUILD .SRCINFO
   git commit -m "Update to version X.Y.Z"
   git push
   ```

## Release Process

### 1. Prepare Release

```bash
# Ensure working directory is clean
git status

# Run tests
pnpm test

# Build everything
pnpm run build
```

### 2. Create Release

```bash
# Interactive release (will prompt for version)
pnpm run release

# Or specify version
pnpm run release -- --increment minor
pnpm run release -- --increment patch
pnpm run release -- --release-version 2.0.0
```

### 3. Post-Release

The release process automatically:
- ✅ Bumps version in package.json
- ✅ Generates CHANGELOG.md
- ✅ Creates Git tag
- ✅ Builds binaries
- ✅ Creates distribution packages
- ✅ Creates GitHub release with assets
- ✅ Publishes to npm

Manual steps:
- Update AUR PKGBUILD (if applicable)
- Update Homebrew formula (if applicable)
- Announce release on social media/blog

## Distribution Checklist

Before releasing a new version:

- [ ] All tests pass (`pnpm test`)
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is reviewed
- [ ] Version follows semver
- [ ] Binaries build successfully (`pnpm run build:binary`)
- [ ] Packages build successfully (`pnpm run build:package`)
- [ ] GitHub release notes are prepared
- [ ] npm credentials are configured
- [ ] GitHub token is configured (for releases)

## Configuration

### pkg Configuration

Edit `config/src/pkg/pkg.config.ts` to customize binary targets:

```typescript
targets: [
  "node20-linux-x64",
  "node20-linux-arm64",
  "node20-macos-x64",
  "node20-macos-arm64",
  "node20-win-x64",
  "node20-win-arm64",
  "node20-alpine-x64",
  "node20-alpine-arm64",
]
```

### nfpm Configuration

Edit `config/src/nfpm/nfpm.config.ts` to customize package metadata:

```typescript
const nfpmConfig = {
  maintainer: "Your Name <email@example.com>",
  description: "Your package description",
  homepage: "https://your-homepage.com",
  license: "MIT",
  // ...
}
```

### release-it Configuration

Edit `config/src/release-it/release-it.config.ts` to customize release behavior:

```typescript
const releaseItConfig = {
  github: {
    release: true,
    assets: [
      "dist/*.tar.gz",
      "dist/*.deb",
      "dist/*.rpm",
      // ...
    ],
  },
  // ...
}
```

## Troubleshooting

### nfpm not found

Install nfpm: https://nfpm.goreleaser.com/install/

### pkg fails to build

- Ensure you have the latest @yao-pkg/pkg: `pnpm add -D @yao-pkg/pkg@latest`
- Check Node.js version compatibility
- Verify all dependencies are installed

### GitHub release fails

- Ensure `GITHUB_TOKEN` is set: `export GITHUB_TOKEN=your_token`
- Or configure in `.env`: `GITHUB_TOKEN=your_token`

### AUR submission fails

- Ensure PKGBUILD follows AUR guidelines
- Update .SRCINFO: `makepkg --printsrcinfo > .SRCINFO`
- Check SSH key is configured for AUR

## Resources

- [nfpm Documentation](https://nfpm.goreleaser.com/)
- [@yao-pkg/pkg Documentation](https://github.com/yao-pkg/pkg)
- [release-it Documentation](https://github.com/release-it/release-it)
- [AUR Submission Guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)
- [Debian Packaging Guide](https://www.debian.org/doc/manuals/debmake-doc/)
- [RPM Packaging Guide](https://rpm-packaging-guide.github.io/)
