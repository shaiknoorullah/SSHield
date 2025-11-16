/** @format */

/**
 * nfpm configuration for creating .deb, .rpm, and .apk packages
 * @see https://nfpm.goreleaser.com/configuration/
 *
 * This configuration follows nfpm v2 schema.
 * Key changes from v1:
 * - Removed `bindir` field (doesn't exist in v2)
 * - Scripts are at top-level, not in overrides
 * - Dependencies use `depends` field at top-level
 * - Format-specific fields go in deb/rpm/apk sections (not overrides)
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
  depends?: string[];
  contents?: Array<{
    src: string;
    dst: string;
    type?: string;
    file_info?: {
      mode?: number;
    };
  }>;
  scripts?: {
    postinstall?: string;
    preremove?: string;
    postremove?: string;
  };
  deb?: {
    fields?: {
      Recommends?: string;
      Bugs?: string;
    };
  };
  rpm?: {
    group?: string;
    compression?: string;
  };
  apk?: {
    [key: string]: unknown;
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
  depends?: string[];
  contents: Array<{
    src: string;
    dst: string;
    type?: string;
    file_info?: {
      mode?: number;
    };
  }>;
  scripts?: {
    postinstall?: string;
    preremove?: string;
    postremove?: string;
  };
  deb?: {
    fields?: {
      Recommends?: string;
      Bugs?: string;
    };
  };
  rpm?: {
    group?: string;
    compression?: string;
  };
  apk?: {
    [key: string]: unknown;
  };
}

/**
 * Default nfpm configuration for simple binary packages
 * Customize per package by extending this config
 *
 * This is for packages with a single binary executable.
 * For Node.js CLIs, see nodeCliNfpmConfig below.
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
  maintainer: "SSHield Team <support@sshield.dev>",
  description: "${PACKAGE_DESCRIPTION}",
  vendor: "SSHield",
  homepage: "https://github.com/shaiknoorullah/sshield",
  license: "MIT",

  // Dependencies (empty by default, override per package)
  depends: [],

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

  // Scripts (common across all formats)
  scripts: {
    postinstall: `#!/bin/sh
echo "\${PACKAGE_NAME} has been installed successfully!"
echo "Run '\${BINARY_NAME} --help' to get started."
`,
    preremove: `#!/bin/sh
echo "Removing \${PACKAGE_NAME}..."
`,
  },

  // Platform-specific settings
  deb: {
    fields: {
      Recommends: "openssh-client",
    },
  },

  rpm: {
    group: "Productivity/Networking/SSH",
    compression: "xz",
  },
};

/**
 * nfpm configuration template for Node.js CLI packages
 *
 * Node.js CLIs require:
 * - Node.js runtime dependency
 * - Copying entire dist/ directory (not just single binary)
 * - Installing npm dependencies via postinstall
 * - Wrapper script to execute the CLI
 *
 * Use this as a reference for Node.js-based packages.
 */
const nodeCliNfpmConfig: NfpmConfig = {
  name: "${PACKAGE_NAME}",
  arch: "amd64",
  platform: "linux",
  version_schema: "semver",

  section: "utils",
  priority: "optional",

  maintainer: "SSHield Team <support@sshield.dev>",
  description: "${PACKAGE_DESCRIPTION}",
  vendor: "SSHield",
  homepage: "https://github.com/shaiknoorullah/sshield",
  license: "MIT",

  // Node.js runtime dependency
  depends: ["nodejs"],

  contents: [
    // Copy entire compiled directory
    {
      src: "./dist/",
      dst: "/usr/lib/${PACKAGE_NAME}/",
      type: "tree",
    },
    // Package metadata
    {
      src: "./package.json",
      dst: "/usr/lib/${PACKAGE_NAME}/package.json",
      type: "file",
    },
    // README
    {
      src: "./README.md",
      dst: "/usr/share/doc/${PACKAGE_NAME}/README.md",
      type: "doc",
    },
    // Executable wrapper script
    {
      src: "./scripts/${BINARY_NAME}.sh",
      dst: "/usr/bin/${BINARY_NAME}",
      type: "file",
      file_info: {
        mode: 0o755,
      },
    },
  ],

  scripts: {
    postinstall: `#!/bin/sh
cd /usr/lib/\${PACKAGE_NAME}
echo "Installing Node.js dependencies..."
npm install --production --ignore-scripts || true
echo "\${PACKAGE_NAME} installed successfully!"
echo "Run '\${BINARY_NAME} --help' to get started."
`,
    preremove: `#!/bin/sh
echo "Removing \${PACKAGE_NAME}..."
`,
    postremove: `#!/bin/sh
rm -rf /usr/lib/\${PACKAGE_NAME}/node_modules
echo "\${PACKAGE_NAME} removed successfully!"
`,
  },

  deb: {
    fields: {
      Recommends: "nodejs (>= 18.0.0)",
    },
  },

  rpm: {
    group: "Development/Tools",
    compression: "xz",
  },
};

/**
 * Generate nfpm YAML configuration following nfpm v2 schema
 * This is used by the nfpm CLI tool
 */
export function generateNfpmYaml(
  packageName: string,
  packageDescription: string,
  binaryName: string,
  version: string,
  useNodeCli = false,
): string {
  const config = JSON.parse(
    JSON.stringify(useNodeCli ? nodeCliNfpmConfig : nfpmConfig),
  );

  // Helper to replace placeholders
  const replacePlaceholders = (str: string): string =>
    str
      .replace(/\$\{PACKAGE_NAME\}/g, packageName)
      .replace(/\$\{BINARY_NAME\}/g, binaryName);

  // Generate contents section
  const contentsYaml = config.contents
    .map(
      (c: {
        src: string;
        dst: string;
        type?: string;
        file_info?: { mode?: number };
      }) => {
        const lines = [
          `  - src: ${replacePlaceholders(c.src)}`,
          `    dst: ${replacePlaceholders(c.dst)}`,
        ];
        if (c.type) {
          lines.push(`    type: ${c.type}`);
        }
        if (c.file_info?.mode) {
          lines.push(`    file_info:`);
          lines.push(`      mode: ${c.file_info.mode.toString(8)}`);
        }
        return lines.join("\n");
      },
    )
    .join("\n");

  // Generate scripts section
  const scriptsYaml = config.scripts
    ? `
scripts:
${
  config.scripts.postinstall
    ? `  postinstall: |\n${config.scripts.postinstall
        .split("\n")
        .map((line: string) => `    ${line}`)
        .join("\n")
        .replace(/\$\{PACKAGE_NAME\}/g, packageName)
        .replace(/\$\{BINARY_NAME\}/g, binaryName)}`
    : ""
}
${
  config.scripts.preremove
    ? `  preremove: |\n${config.scripts.preremove
        .split("\n")
        .map((line: string) => `    ${line}`)
        .join("\n")
        .replace(/\$\{PACKAGE_NAME\}/g, packageName)
        .replace(/\$\{BINARY_NAME\}/g, binaryName)}`
    : ""
}
${
  config.scripts.postremove
    ? `  postremove: |\n${config.scripts.postremove
        .split("\n")
        .map((line: string) => `    ${line}`)
        .join("\n")
        .replace(/\$\{PACKAGE_NAME\}/g, packageName)
        .replace(/\$\{BINARY_NAME\}/g, binaryName)}`
    : ""
}
`
    : "";

  // Generate depends section
  const dependsYaml =
    config.depends && config.depends.length > 0
      ? `
depends:
${config.depends.map((d: string) => `  - ${d}`).join("\n")}
`
      : "";

  // Generate format-specific sections
  const debYaml = config.deb
    ? `
deb:
${
  config.deb.fields
    ? `  fields:\n${Object.entries(config.deb.fields)
        .map(([k, v]) => `    ${k}: ${v}`)
        .join("\n")}`
    : ""
}
`
    : "";

  const rpmYaml = config.rpm
    ? `
rpm:
${config.rpm.group ? `  group: ${config.rpm.group}` : ""}
${config.rpm.compression ? `  compression: ${config.rpm.compression}` : ""}
`
    : "";

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
${dependsYaml}
contents:
${contentsYaml}
${scriptsYaml}${debYaml}${rpmYaml}`;

  return yaml;
}

export default nfpmConfig;
export { nodeCliNfpmConfig };
export type { NfpmConfig, NfpmPackage };
