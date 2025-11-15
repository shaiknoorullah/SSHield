#!/usr/bin/env node
/** @format */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Package distribution script
 * Creates .deb, .rpm, .apk, and PKGBUILD for different package managers
 */

// Get package info from package.json
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const PACKAGE_NAME = packageJson.name.replace("@sshield/", "");
const PACKAGE_VERSION = packageJson.version;
const PACKAGE_DESCRIPTION = packageJson.description || "SSHield package";
const BINARY_NAME = packageJson.bin
  ? Object.keys(packageJson.bin)[0]
  : PACKAGE_NAME;

console.log(`📦 Packaging ${PACKAGE_NAME}@${PACKAGE_VERSION}...`);

/**
 * Generate nfpm.yaml configuration
 */
function generateNfpmYaml() {
  const nfpmYaml = `# nfpm configuration for ${PACKAGE_NAME}
# https://nfpm.goreleaser.com/configuration/

name: ${PACKAGE_NAME}
arch: amd64
platform: linux
version: ${PACKAGE_VERSION}
version_schema: semver

section: utils
priority: optional

maintainer: SSHield Team <support@sshield.dev>
description: ${PACKAGE_DESCRIPTION}
vendor: SSHield
homepage: https://github.com/shaiknoorullah/sshield
license: MIT

bindir: /usr/bin

contents:
  - src: ./dist/${BINARY_NAME}
    dst: /usr/bin/${BINARY_NAME}
    type: file
    file_info:
      mode: 0755

  - src: ./README.md
    dst: /usr/share/doc/${PACKAGE_NAME}/README.md
    type: doc

  - src: ./LICENSE
    dst: /usr/share/doc/${PACKAGE_NAME}/LICENSE
    type: license

overrides:
  deb:
    scripts:
      postinstall: |
        #!/bin/sh
        echo "${PACKAGE_NAME} has been installed successfully!"
        echo "Run '${BINARY_NAME} --help' to get started."
      preremove: |
        #!/bin/sh
        echo "Removing ${PACKAGE_NAME}..."
    dependencies: []
    recommends:
      - openssh-client

  rpm:
    scripts:
      postinstall: |
        #!/bin/sh
        echo "${PACKAGE_NAME} has been installed successfully!"
        echo "Run '${BINARY_NAME} --help' to get started."
      preremove: |
        #!/bin/sh
        echo "Removing ${PACKAGE_NAME}..."
    dependencies: []

  apk:
    scripts:
      postinstall: |
        #!/bin/sh
        echo "${PACKAGE_NAME} has been installed successfully!"
        echo "Run '${BINARY_NAME} --help' to get started."
      preremove: |
        #!/bin/sh
        echo "Removing ${PACKAGE_NAME}..."
    dependencies: []
`;

  const nfpmPath = path.join(process.cwd(), "nfpm.yaml");
  fs.writeFileSync(nfpmPath, nfpmYaml, "utf-8");
  console.log(`✅ Generated nfpm.yaml`);
  return nfpmPath;
}

/**
 * Generate PKGBUILD for Arch Linux
 */
function generatePkgbuild() {
  const pkgbuild = `# Maintainer: SSHield Team <support@sshield.dev>

pkgname=${PACKAGE_NAME}
pkgver=${PACKAGE_VERSION}
pkgrel=1
pkgdesc='${PACKAGE_DESCRIPTION}'
arch=('x86_64' 'aarch64')
url='https://github.com/shaiknoorullah/sshield'
license=('MIT')
depends=()
makedepends=()
provides=('${PACKAGE_NAME}')
conflicts=('${PACKAGE_NAME}-bin')
source=("\${pkgname}-\${pkgver}.tar.gz::https://github.com/shaiknoorullah/sshield/releases/download/v\${pkgver}/\${pkgname}-\${pkgver}.tar.gz")
sha256sums=('SKIP')

build() {
    cd "\${srcdir}/\${pkgname}-\${pkgver}"
    # Pre-built binaries, no build needed
    true
}

check() {
    cd "\${srcdir}/\${pkgname}-\${pkgver}"
    # Run tests if available
    true
}

package() {
    cd "\${srcdir}/\${pkgname}-\${pkgver}"

    # Install binary
    install -Dm755 "\${pkgname}" "\${pkgdir}/usr/bin/\${pkgname}"

    # Install documentation
    install -Dm644 README.md "\${pkgdir}/usr/share/doc/\${pkgname}/README.md"
    install -Dm644 LICENSE "\${pkgdir}/usr/share/licenses/\${pkgname}/LICENSE"
}
`;

  const pkgbuildPath = path.join(process.cwd(), "PKGBUILD");
  fs.writeFileSync(pkgbuildPath, pkgbuild, "utf-8");
  console.log(`✅ Generated PKGBUILD`);
  return pkgbuildPath;
}

/**
 * Generate binary PKGBUILD for Arch Linux
 */
function generateBinaryPkgbuild() {
  const pkgbuild = `# Maintainer: SSHield Team <support@sshield.dev>

pkgname=${PACKAGE_NAME}-bin
pkgver=${PACKAGE_VERSION}
pkgrel=1
pkgdesc='${PACKAGE_DESCRIPTION} (binary release)'
arch=('x86_64' 'aarch64')
url='https://github.com/shaiknoorullah/sshield'
license=('MIT')
depends=()
provides=('${PACKAGE_NAME}')
conflicts=('${PACKAGE_NAME}')
source_x86_64=("\${pkgname%-bin}-\${pkgver}-x86_64::https://github.com/shaiknoorullah/sshield/releases/download/v\${pkgver}/\${pkgname%-bin}-linux-x64")
source_aarch64=("\${pkgname%-bin}-\${pkgver}-aarch64::https://github.com/shaiknoorullah/sshield/releases/download/v\${pkgver}/\${pkgname%-bin}-linux-arm64")
sha256sums_x86_64=('SKIP')
sha256sums_aarch64=('SKIP')

package() {
    # Determine architecture
    if [ "\${CARCH}" = "x86_64" ]; then
        _binary="\${pkgname%-bin}-\${pkgver}-x86_64"
    elif [ "\${CARCH}" = "aarch64" ]; then
        _binary="\${pkgname%-bin}-\${pkgver}-aarch64"
    fi

    # Install binary
    install -Dm755 "\${srcdir}/\${_binary}" "\${pkgdir}/usr/bin/\${pkgname%-bin}"
}
`;

  const pkgbuildBinPath = path.join(process.cwd(), "PKGBUILD.bin");
  fs.writeFileSync(pkgbuildBinPath, pkgbuild, "utf-8");
  console.log(`✅ Generated PKGBUILD.bin (for binary distribution)`);
  return pkgbuildBinPath;
}

/**
 * Build packages with nfpm
 */
function buildPackages(nfpmPath) {
  // Check if nfpm is installed
  try {
    execSync("which nfpm", { stdio: "ignore" });
  } catch {
    console.warn(
      "⚠️  nfpm not found. Install it from https://nfpm.goreleaser.com/install/",
    );
    console.warn(
      "   Skipping package generation. PKGBUILD files have been created.",
    );
    return;
  }

  // Create dist directory if it doesn't exist
  const distDir = path.join(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  try {
    // Build .deb package
    console.log("🔨 Building .deb package...");
    execSync(`nfpm package --packager deb --config ${nfpmPath}`, {
      stdio: "inherit",
    });
    console.log("✅ Built .deb package");

    // Build .rpm package
    console.log("🔨 Building .rpm package...");
    execSync(`nfpm package --packager rpm --config ${nfpmPath}`, {
      stdio: "inherit",
    });
    console.log("✅ Built .rpm package");

    // Build .apk package (Alpine Linux)
    console.log("🔨 Building .apk package...");
    execSync(`nfpm package --packager apk --config ${nfpmPath}`, {
      stdio: "inherit",
    });
    console.log("✅ Built .apk package");
  } catch (error) {
    console.error("❌ Error building packages:", error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log("🚀 Starting package distribution...\n");

  // Generate configurations
  const nfpmPath = generateNfpmYaml();
  generatePkgbuild();
  generateBinaryPkgbuild();

  console.log("");

  // Build packages
  buildPackages(nfpmPath);

  console.log("\n✨ Package distribution complete!");
  console.log("\nGenerated files:");
  console.log("  - nfpm.yaml (nfpm configuration)");
  console.log("  - PKGBUILD (Arch Linux source package)");
  console.log("  - PKGBUILD.bin (Arch Linux binary package)");
  console.log("  - dist/*.deb (Debian/Ubuntu package)");
  console.log("  - dist/*.rpm (Fedora/RHEL package)");
  console.log("  - dist/*.apk (Alpine Linux package)");
}

main();
