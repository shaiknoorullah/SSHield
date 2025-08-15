import * as path from "path";
import * as fs from "fs-extra";
import { v7 as uuid } from "uuid";
import { SSHKey, KeyType, CommandOptions } from "../types";
import { exec } from "child_process";
import util from "util";
import {
  KEYS_DIR,
  DEFAULT_KEY_TYPE,
  DEFAULT_KEY_BITS,
  DEFAULT_KDF_ROUNDS,
} from "../constants";
import {
  generateKey,
  getKeyFingerprint,
  addKeyToAgent,
  removeKeyFromAgent,
  generateKeyName,
} from "../utils/ssh";
import {
  loadProject,
  getActiveProject,
  addKeyToProject,
  removeKeyFromProject,
} from "../utils/config";
import { ensureDirectory, fileExists } from "../utils/filesystem";
import {
  log,
  prompt,
  createSpinner,
  renderBox,
  formatKeyValueList,
} from "../utils/ui";

/**
 * Generate a new SSH key
 */
export const generateSshKey = async (
  options: {
    projectId?: string;
    name?: string;
    type?: KeyType;
    bits?: number;
    kdfRounds?: number;
    comment?: string;
    passphrase?: string;
    force?: boolean;
  } & CommandOptions
): Promise<SSHKey> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Get key details from options or prompt for them
    const keyName =
      options.name ||
      (await prompt.input(
        "Enter a name for the key (e.g., production-server):",
        `${projectId}-key-${new Date().getTime()}`
      ));

    // Generate a unique ID for the key
    const keyId = uuid();

    // Set key parameters
    const keyType = options.type || DEFAULT_KEY_TYPE;
    const keyBits = options.bits || DEFAULT_KEY_BITS;
    const kdfRounds = options.kdfRounds || DEFAULT_KDF_ROUNDS;
    const comment =
      options.comment || `${keyName} (${projectId}) created by ssh-manager`;

    // Get passphrase if not provided
    let passphrase = options.passphrase;
    if (!passphrase && !options.json) {
      passphrase = await prompt.password(
        "Enter passphrase for the key (leave empty for no passphrase):"
      );

      // Confirm passphrase if not empty
      if (passphrase) {
        const confirmPassphrase = await prompt.password("Confirm passphrase:");

        if (passphrase !== confirmPassphrase) {
          throw new Error("Passphrases do not match");
        }
      }
    }

    // Create a unique file name for the key
    const fileName = generateKeyName(keyName);

    // Create directory for the project's keys
    const projectKeyDir = path.join(KEYS_DIR, projectId);
    await ensureDirectory(projectKeyDir);

    // Path for the key
    const keyPath = path.join(projectKeyDir, fileName);

    // Check if the key already exists
    if ((await fileExists(keyPath)) && !options.force) {
      throw new Error(
        `Key file ${keyPath} already exists. Use --force to overwrite.`
      );
    }

    // Show a spinner while generating the key
    const spinner = createSpinner("Generating SSH key...");
    spinner.start();

    // Generate the key
    await generateKey(keyPath, {
      type: keyType,
      bits: keyBits,
      kdfRounds,
      passphrase,
      comment,
    });

    // Get the key's fingerprint
    const fingerprint = await getKeyFingerprint(keyPath);

    spinner.succeed("SSH key generated successfully");

    // Create the SSHKey object
    const sshKey: SSHKey = {
      id: keyId,
      name: keyName,
      type: keyType,
      path: keyPath,
      publicKeyPath: `${keyPath}.pub`,
      fingerprint,
      created: new Date().toISOString(),
      comment,
      bits: keyBits,
      kdfRounds,
    };

    // Add the key to the project
    await addKeyToProject(projectId, sshKey);

    // Show key details
    renderBox(
      formatKeyValueList({
        "Key ID": sshKey.id,
        "Key Name": sshKey.name,
        Type: sshKey.type,
        Bits: sshKey.bits,
        Fingerprint: sshKey.fingerprint,
        Path: sshKey.path,
        "Public Key": sshKey.publicKeyPath,
        Created: new Date(sshKey.created).toLocaleString(),
      }),
      "SSH Key Generated",
      "green"
    );

    return sshKey;
  } catch (error: any) {
    log.error(`Failed to generate SSH key: ${error.message}`);
    throw error;
  }
};

/**
 * List all SSH keys for a project
 */
export const listSshKeys = async (
  options: {
    projectId?: string;
  } & CommandOptions
): Promise<SSHKey[]> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Check if there are any keys
    if (project.keys.length === 0) {
      log.info(`No SSH keys found for project ${projectId}.`);
      return [];
    }

    // Display the keys
    if (!options.json) {
      log.info(`SSH keys for project ${project.name} (${projectId}):`);

      const keyStrings = project.keys.map((key, index) => {
        return formatKeyValueList({
          "Key ID": key.id,
          "Key Name": key.name,
          Type: key.type,
          Fingerprint: key.fingerprint,
          Created: new Date(key.created).toLocaleString(),
          "Last Used": key.lastUsed
            ? new Date(key.lastUsed).toLocaleString()
            : "Never",
        });
      });

      renderBox(keyStrings.join("\n\n"), "SSH Keys", "blue");
    }

    return project.keys;
  } catch (error: any) {
    log.error(`Failed to list SSH keys: ${error.message}`);
    throw error;
  }
};

/**
 * Delete an SSH key
 */
export const deleteSshKey = async (
  keyId: string,
  options: {
    projectId?: string;
    removeFiles?: boolean;
  } & CommandOptions
): Promise<void> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Find the key
    const key = project.keys.find((k) => k.id === keyId);
    if (!key) {
      throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
    }

    // Confirm deletion if not in JSON mode
    if (!options.json) {
      const confirmed = await prompt.confirm(
        `Are you sure you want to delete the key "${key.name}" (${key.fingerprint})? This cannot be undone.`,
        false
      );

      if (!confirmed) {
        log.info("Deletion cancelled.");
        return;
      }
    }
    // Remove the key from the SSH agent if it's loaded
    try {
      await removeKeyFromAgent(key.path);
    } catch (error: any) {
      // Ignore errors, the key might not be loaded
      log.debug(`Failed to remove key from agent: ${error.message}`);
    }

    // Remove the key files if requested
    if (options.removeFiles) {
      try {
        await fs.unlink(key.path);
        await fs.unlink(key.publicKeyPath);
        log.success(`Key files deleted: ${key.path}`);
      } catch (error: any) {
        log.warn(`Failed to delete key files: ${error.message}`);
      }
    }

    // Remove the key from the project
    await removeKeyFromProject(projectId, keyId);

    log.success(`Key "${key.name}" deleted from project ${project.name}`);
  } catch (error: any) {
    log.error(`Failed to delete SSH key: ${error.message}`);
    throw error;
  }
};

/**
 * Get an SSH key by ID
 */
export const getSshKey = async (
  keyId: string,
  options: {
    projectId?: string;
  } & CommandOptions
): Promise<SSHKey> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Find the key
    const key = project.keys.find((k) => k.id === keyId);
    if (!key) {
      throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
    }

    // Display the key details
    if (!options.json) {
      renderBox(
        formatKeyValueList({
          "Key ID": key.id,
          "Key Name": key.name,
          Type: key.type,
          Bits: key.bits || "Unknown",
          Fingerprint: key.fingerprint,
          Path: key.path,
          "Public Key": key.publicKeyPath,
          Created: new Date(key.created).toLocaleString(),
          "Last Used": key.lastUsed
            ? new Date(key.lastUsed).toLocaleString()
            : "Never",
          Comment: key.comment || "None",
        }),
        `SSH Key: ${key.name}`,
        "blue"
      );
    }

    return key;
  } catch (error: any) {
    log.error(`Failed to get SSH key: ${error.message}`);
    throw error;
  }
};

/**
 * Add an SSH key to the agent
 */
export const addKeyToAgentCommand = async (
  keyId: string,
  options: {
    projectId?: string;
    lifetime?: number;
    passphrase?: string;
  } & CommandOptions
): Promise<void> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Find the key
    const key = project.keys.find((k) => k.id === keyId);
    if (!key) {
      throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
    }

    // Get passphrase if not provided
    let passphrase = options.passphrase;
    if (!passphrase && !options.json) {
      passphrase = await prompt.password(
        `Enter passphrase for key "${key.name}" (leave empty if no passphrase):`
      );
    }

    // Show a spinner while adding the key
    const spinner = createSpinner(`Adding key "${key.name}" to SSH agent...`);
    spinner.start();

    // Add the key to the agent
    await addKeyToAgent(key.path, {
      lifetime: options.lifetime,
      passphrase,
    });

    spinner.succeed(`Key "${key.name}" added to SSH agent`);

    // Update the key's last used timestamp
    key.lastUsed = new Date().toISOString();
    await addKeyToProject(projectId, key);
  } catch (error: any) {
    log.error(`Failed to add key to agent: ${error.message}`);
    throw error;
  }
};

/**
 * Show the public key
 */
export const showPublicKey = async (
  keyId: string,
  options: {
    projectId?: string;
    clipboard?: boolean;
  } & CommandOptions
): Promise<string> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Find the key
    const key = project.keys.find((k) => k.id === keyId);
    if (!key) {
      throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
    }

    // Read the public key
    const publicKey = await fs.readFile(key.publicKeyPath, "utf8");

    // Copy to clipboard if requested
    if (options.clipboard) {
      try {
        await fs.writeFile("/tmp/ssh-key-temp", publicKey);
        await fs.chmod("/tmp/ssh-key-temp", 0o600);

        const execAsync = util.promisify(exec);

        await execAsync("cat /tmp/ssh-key-temp | xclip -selection clipboard");
        await fs.unlink("/tmp/ssh-key-temp");
        log.success("Public key copied to clipboard");
      } catch (error: any) {
        log.warn(`Failed to copy to clipboard: ${error.message}`);
        log.info("Make sure xclip is installed: sudo apt install xclip");
      }
    }
    // Display the public key
    if (!options.json) {
      renderBox(publicKey.trim(), `Public Key: ${key.name}`, "green");
    }

    return publicKey;
  } catch (error: any) {
    log.error(`Failed to show public key: ${error.message}`);
    throw error;
  }
};

/**
 * Import an existing SSH key
 */
export const importSshKey = async (
  keyPath: string,
  options: {
    projectId?: string;
    name?: string;
    copy?: boolean;
  } & CommandOptions
): Promise<SSHKey> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Check if the private key exists
    if (!(await fileExists(keyPath))) {
      throw new Error(`Key file ${keyPath} does not exist`);
    }

    // Check if the public key exists
    const publicKeyPath = `${keyPath}.pub`;
    if (!(await fileExists(publicKeyPath))) {
      throw new Error(`Public key file ${publicKeyPath} does not exist`);
    }

    // Generate a name for the key if not provided
    const keyName = options.name || path.basename(keyPath);

    // Generate a unique ID for the key
    const keyId = uuid();

    // Get the key's fingerprint
    const fingerprint = await getKeyFingerprint(keyPath);

    // Determine the key type
    const publicKey = await fs.readFile(publicKeyPath, "utf8");
    const keyTypeMatch = publicKey.match(/^(ssh-[a-z0-9]+)/);
    const keyType = (keyTypeMatch?.[1] || "unknown") as KeyType;

    // Create a proper destination for the key if copying
    let destKeyPath = keyPath;
    let destPublicKeyPath = publicKeyPath;

    if (options.copy) {
      // Create directory for the project's keys
      const projectKeyDir = path.join(KEYS_DIR, projectId);
      await ensureDirectory(projectKeyDir);

      // Create a unique file name for the key
      const fileName = generateKeyName(keyName);

      // Path for the key
      destKeyPath = path.join(projectKeyDir, fileName);
      destPublicKeyPath = `${destKeyPath}.pub`;

      // Copy the key files
      await fs.copy(keyPath, destKeyPath);
      await fs.copy(publicKeyPath, destPublicKeyPath);

      // Set proper permissions
      await fs.chmod(destKeyPath, 0o600);
      await fs.chmod(destPublicKeyPath, 0o644);

      log.success(`Key files copied to ${destKeyPath}`);
    }

    // Create the SSHKey object
    const sshKey: SSHKey = {
      id: keyId,
      name: keyName,
      type: keyType,
      path: destKeyPath,
      publicKeyPath: destPublicKeyPath,
      fingerprint,
      created: new Date().toISOString(),
    };

    // Add the key to the project
    await addKeyToProject(projectId, sshKey);

    // Show key details
    renderBox(
      formatKeyValueList({
        "Key ID": sshKey.id,
        "Key Name": sshKey.name,
        Type: sshKey.type,
        Fingerprint: sshKey.fingerprint,
        Path: sshKey.path,
        "Public Key": sshKey.publicKeyPath,
        Created: new Date(sshKey.created).toLocaleString(),
      }),
      "SSH Key Imported",
      "green"
    );

    return sshKey;
  } catch (error: any) {
    log.error(`Failed to import SSH key: ${error.message}`);
    throw error;
  }
};
