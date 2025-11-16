/** @format */

/**
 * nfpm configuration for creating .deb, .rpm, and .apk packages
 * @see https://nfpm.goreleaser.com/configuration/
 */

interface NfpmPackage {
  name: string;
  arch: string;
  platform: string;
  version: string;
  section?: string;
  priority?: string;
  maintainer: string;
  description: string;
  vendor?: string;
  homepage: string;
  license: string;
  bindir?: string;
  contents?: Array<{
    src: string;
    dst: string;
    type?: string;
    file_info?: {
      mode?: number;
    };
  }>;
  overrides?: {
    deb?: Partial<NfpmPackage>;
    rpm?: Partial<NfpmPackage>;
    apk?: Partial<NfpmPackage>;
  };
}

interface NfpmConfig {
  name: string;
  arch: string;
  platform: string;
  version_schema?: string;
  section: string;
  priority: string;
  maintainer: string;
  description: string;
  vendor: string;
  homepage: string;
  license: string;
  bindir: string;
  contents: Array<{
    src: string;
    dst: string;
    type?: string;
    file_info?: {
      mode?: number;
    };
  }>;
  overrides?: {
    deb?: {
      scripts?: {
        postinstall?: string;
        preremove?: string;
      };
      dependencies?: string[];
      recommends?: string[];
    };
    rpm?: {
      scripts?: {
        postinstall?: string;
        preremove?: string;
      };
      dependencies?: string[];
    };
    apk?: {
      scripts?: {
        postinstall?: string;
        preremove?: string;
      };
      dependencies?: string[];
    };
  };
}

/**
 * Default nfpm configuration
 * Customize per package by extending this config
 */
const nfpmConfig: NfpmConfig = {
  // Package metadata
  name: "${PACKAGE_NAME}",
  arch: "amd64",
  platform: "linux",
  version_schema: "semver",

  // Debian-specific metadata
  section: "utils",
  priority: "optional",

  // Maintainer information
  maintainer: "SSHield Team <noor@sshield.sh>",
  description: "${PACKAGE_DESCRIPTION}",
  vendor: "SSHield",
  homepage: "https://github.com/shaiknoorullah/sshield",
  license: "MIT",

  // Installation paths
  bindir: "/usr/bin",

  // Files to include in the package
  contents: [
    {
      src: "./dist/${BINARY_NAME}",
      dst: "/usr/bin/${BINARY_NAME}",
      type: "file",
      file_info: {
        mode: 0o755,
      },
    },
    {
      src: "./README.md",
      dst: "/usr/share/doc/${PACKAGE_NAME}/README.md",
      type: "doc",
    },
    {
      src: "./LICENSE",
      dst: "/usr/share/doc/${PACKAGE_NAME}/LICENSE",
      type: "license",
    },
  ],

  // Platform-specific overrides
  overrides: {
    // Debian/Ubuntu (.deb)
    deb: {
      scripts: {
        postinstall: `#!/bin/sh
echo "SSHield has been installed successfully!"
echo "Run '\${BINARY_NAME} --help' to get started."
`,
        preremove: `#!/bin/sh
echo "Removing SSHield..."
`,
      },
      dependencies: [],
      recommends: ["openssh-client"],
    },

    // Fedora/RHEL (.rpm)
    rpm: {
      scripts: {
        postinstall: `#!/bin/sh
echo "SSHield has been installed successfully!"
echo "Run '\${BINARY_NAME} --help' to get started."
`,
        preremove: `#!/bin/sh
echo "Removing SSHield..."
`,
      },
      dependencies: [],
    },

    // Alpine (.apk)
    apk: {
      scripts: {
        postinstall: `#!/bin/sh
echo "SSHield has been installed successfully!"
echo "Run '\${BINARY_NAME} --help' to get started."
`,
        preremove: `#!/bin/sh
echo "Removing SSHield..."
`,
      },
      dependencies: [],
    },
  },
};

/**
 * Generate nfpm YAML configuration
 * This is used by the nfpm CLI tool
 */
export function generateNfpmYaml(
  packageName: string,
  packageDescription: string,
  binaryName: string,
  version: string,
): string {
  const config = JSON.parse(JSON.stringify(nfpmConfig));

  // Replace placeholders
  const yaml = `# Generated nfpm configuration
# https://nfpm.goreleaser.com/configuration/

name: ${packageName}
arch: ${config.arch}
platform: ${config.platform}
version: ${version}
version_schema: ${config.version_schema}

section: ${config.section}
priority: ${config.priority}

maintainer: ${config.maintainer}
description: ${packageDescription}
vendor: ${config.vendor}
homepage: ${config.homepage}
license: ${config.license}

bindir: ${config.bindir}

contents:
${config.contents
  .map(
    (c: {
      src: string;
      dst: string;
      type?: string;
      file_info?: { mode?: number };
    }) =>
      `  - src: ${c.src.replace("${PACKAGE_NAME}", packageName).replace("${BINARY_NAME}", binaryName)}
    dst: ${c.dst.replace("${PACKAGE_NAME}", packageName).replace("${BINARY_NAME}", binaryName)}
    type: ${c.type || "file"}
    file_info:
      mode: ${c.file_info?.mode || 0o644}`,
  )
  .join("\n")}

overrides:
  deb:
    scripts:
      postinstall: |
${config.overrides?.deb?.scripts?.postinstall
  ?.split("\n")
  .map((line: string) => `        ${line}`)
  .join("\n")
  .replace(/\$\{BINARY_NAME\}/g, binaryName)}
      preremove: |
${config.overrides?.deb?.scripts?.preremove
  ?.split("\n")
  .map((line: string) => `        ${line}`)
  .join("\n")}
    dependencies:
${config.overrides?.deb?.dependencies?.map((d: string) => `      - ${d}`).join("\n") || "      []"}
    recommends:
${config.overrides?.deb?.recommends?.map((r: string) => `      - ${r}`).join("\n") || "      []"}

  rpm:
    scripts:
      postinstall: |
${config.overrides?.rpm?.scripts?.postinstall
  ?.split("\n")
  .map((line: string) => `        ${line}`)
  .join("\n")
  .replace(/\$\{BINARY_NAME\}/g, binaryName)}
      preremove: |
${config.overrides?.rpm?.scripts?.preremove
  ?.split("\n")
  .map((line: string) => `        ${line}`)
  .join("\n")}
    dependencies:
${config.overrides?.rpm?.dependencies?.map((d: string) => `      - ${d}`).join("\n") || "      []"}

  apk:
    scripts:
      postinstall: |
${config.overrides?.apk?.scripts?.postinstall
  ?.split("\n")
  .map((line: string) => `        ${line}`)
  .join("\n")
  .replace(/\$\{BINARY_NAME\}/g, binaryName)}
      preremove: |
${config.overrides?.apk?.scripts?.preremove
  ?.split("\n")
  .map((line: string) => `        ${line}`)
  .join("\n")}
    dependencies:
${config.overrides?.apk?.dependencies?.map((d: string) => `      - ${d}`).join("\n") || "      []"}
`;

  return yaml;
}

export default nfpmConfig;
export type { NfpmConfig, NfpmPackage };
