/** @format */

/**
 * PKGBUILD template generator for Arch Linux AUR
 * @see https://wiki.archlinux.org/title/PKGBUILD
 */

interface PkgbuildConfig {
  pkgname: string;
  pkgver: string;
  pkgrel: string;
  pkgdesc: string;
  arch: string[];
  url: string;
  license: string[];
  depends?: string[];
  makedepends?: string[];
  optdepends?: string[];
  provides?: string[];
  conflicts?: string[];
  source: string[];
  sha256sums?: string[];
  maintainer: string;
  contributors?: string[];
}

/**
 * Generate PKGBUILD file for Arch Linux AUR
 */
export function generatePkgbuild(config: Partial<PkgbuildConfig>): string {
  const {
    pkgname = "${PACKAGE_NAME}",
    pkgver = "${VERSION}",
    pkgrel = "1",
    pkgdesc = "${DESCRIPTION}",
    arch = ["x86_64", "aarch64"],
    url = "https://github.com/shaiknoorullah/sshield",
    license = ["MIT"],
    depends = [],
    makedepends = [],
    optdepends = [],
    provides = [],
    conflicts = [],
    source = [
      `\${pkgname}-\${pkgver}.tar.gz::https://github.com/shaiknoorullah/sshield/releases/download/v\${pkgver}/\${pkgname}-\${pkgver}.tar.gz`,
    ],
    sha256sums = ["SKIP"],
    maintainer = "SSHield Team <support@sshield.dev>",
    contributors = [],
  } = config;

  return `# Maintainer: ${maintainer}
${contributors.map((c) => `# Contributor: ${c}`).join("\n")}${contributors.length > 0 ? "\n" : ""}
pkgname=${pkgname}
pkgver=${pkgver}
pkgrel=${pkgrel}
pkgdesc='${pkgdesc}'
arch=(${arch.map((a) => `'${a}'`).join(" ")})
url='${url}'
license=(${license.map((l) => `'${l}'`).join(" ")})
${depends.length > 0 ? `depends=(${depends.map((d) => `'${d}'`).join(" ")})` : ""}
${makedepends.length > 0 ? `makedepends=(${makedepends.map((m) => `'${m}'`).join(" ")})` : ""}
${optdepends.length > 0 ? `optdepends=(${optdepends.map((o) => `'${o}'`).join("\n           ")})` : ""}
${provides.length > 0 ? `provides=(${provides.map((p) => `'${p}'`).join(" ")})` : ""}
${conflicts.length > 0 ? `conflicts=(${conflicts.map((c) => `'${c}'`).join(" ")})` : ""}
source=(${source.map((s) => `'${s}'`).join("\n        ")})
sha256sums=(${sha256sums.map((s) => `'${s}'`).join("\n            ")})

build() {
    cd "\${srcdir}/\${pkgname}-\${pkgver}"

    # If building from source with Node.js
    # npm install
    # npm run build

    # If using pre-built binaries, skip build step
    true
}

check() {
    cd "\${srcdir}/\${pkgname}-\${pkgver}"

    # Run tests if available
    # npm test

    true
}

package() {
    cd "\${srcdir}/\${pkgname}-\${pkgver}"

    # Install binary
    install -Dm755 "\${pkgname}" "\${pkgdir}/usr/bin/\${pkgname}"

    # Install documentation
    install -Dm644 README.md "\${pkgdir}/usr/share/doc/\${pkgname}/README.md"
    install -Dm644 LICENSE "\${pkgdir}/usr/share/licenses/\${pkgname}/LICENSE"

    # Install man pages if available
    # install -Dm644 man/\${pkgname}.1 "\${pkgdir}/usr/share/man/man1/\${pkgname}.1"

    # Install shell completions if available
    # install -Dm644 completions/bash/\${pkgname} "\${pkgdir}/usr/share/bash-completion/completions/\${pkgname}"
    # install -Dm644 completions/zsh/_\${pkgname} "\${pkgdir}/usr/share/zsh/site-functions/_\${pkgname}"
    # install -Dm644 completions/fish/\${pkgname}.fish "\${pkgdir}/usr/share/fish/vendor_completions.d/\${pkgname}.fish"
}
`;
}

/**
 * Generate PKGBUILD for binary distribution (pre-built binaries)
 */
export function generateBinaryPkgbuild(config: Partial<PkgbuildConfig>): string {
  const {
    pkgname = "${PACKAGE_NAME}",
    pkgver = "${VERSION}",
    pkgrel = "1",
    pkgdesc = "${DESCRIPTION}",
    arch = ["x86_64", "aarch64"],
    url = "https://github.com/shaiknoorullah/sshield",
    license = ["MIT"],
    depends = [],
    optdepends = [],
    provides = [],
    conflicts = [],
    maintainer = "SSHield Team <support@sshield.dev>",
    contributors = [],
  } = config;

  return `# Maintainer: ${maintainer}
${contributors.map((c) => `# Contributor: ${c}`).join("\n")}${contributors.length > 0 ? "\n" : ""}
pkgname=${pkgname}-bin
pkgver=${pkgver}
pkgrel=${pkgrel}
pkgdesc='${pkgdesc} (binary release)'
arch=(${arch.map((a) => `'${a}'`).join(" ")})
url='${url}'
license=(${license.map((l) => `'${l}'`).join(" ")})
${depends.length > 0 ? `depends=(${depends.map((d) => `'${d}'`).join(" ")})` : ""}
${optdepends.length > 0 ? `optdepends=(${optdepends.map((o) => `'${o}'`).join("\n           ")})` : ""}
${provides.length > 0 ? `provides=('${pkgname}' ${provides.map((p) => `'${p}'`).join(" ")})` : `provides=('${pkgname}')`}
${conflicts.length > 0 ? `conflicts=('${pkgname}' ${conflicts.map((c) => `'${c}'`).join(" ")})` : `conflicts=('${pkgname}')`}
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
}

/**
 * Generate .SRCINFO file for AUR
 * This is generated from PKGBUILD using: makepkg --printsrcinfo > .SRCINFO
 */
export function generateSrcinfo(pkgbuild: string): string {
  // In practice, this should be generated by makepkg
  // This is just a placeholder
  return `# Generated by makepkg
# Run: makepkg --printsrcinfo > .SRCINFO
`;
}

const pkgbuildConfig = {
  generatePkgbuild,
  generateBinaryPkgbuild,
  generateSrcinfo,
};

export default pkgbuildConfig;
export type { PkgbuildConfig };
