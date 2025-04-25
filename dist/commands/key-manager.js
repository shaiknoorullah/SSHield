"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSshKey = exports.showPublicKey = exports.addKeyToAgentCommand = exports.getSshKey = exports.deleteSshKey = exports.listSshKeys = exports.generateSshKey = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const uuid_1 = require("uuid");
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const constants_1 = require("../constants");
const ssh_1 = require("../utils/ssh");
const config_1 = require("../utils/config");
const filesystem_1 = require("../utils/filesystem");
const ui_1 = require("../utils/ui");
/**
 * Generate a new SSH key
 */
const generateSshKey = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Get key details from options or prompt for them
        const keyName = options.name ||
            (await ui_1.prompt.input("Enter a name for the key (e.g., production-server):", `${projectId}-key-${new Date().getTime()}`));
        // Generate a unique ID for the key
        const keyId = (0, uuid_1.v7)();
        // Set key parameters
        const keyType = options.type || constants_1.DEFAULT_KEY_TYPE;
        const keyBits = options.bits || constants_1.DEFAULT_KEY_BITS;
        const kdfRounds = options.kdfRounds || constants_1.DEFAULT_KDF_ROUNDS;
        const comment = options.comment || `${keyName} (${projectId}) created by ssh-manager`;
        // Get passphrase if not provided
        let passphrase = options.passphrase;
        if (!passphrase && !options.json) {
            passphrase = await ui_1.prompt.password("Enter passphrase for the key (leave empty for no passphrase):");
            // Confirm passphrase if not empty
            if (passphrase) {
                const confirmPassphrase = await ui_1.prompt.password("Confirm passphrase:");
                if (passphrase !== confirmPassphrase) {
                    throw new Error("Passphrases do not match");
                }
            }
        }
        // Create a unique file name for the key
        const fileName = (0, ssh_1.generateKeyName)(keyName);
        // Create directory for the project's keys
        const projectKeyDir = path.join(constants_1.KEYS_DIR, projectId);
        await (0, filesystem_1.ensureDirectory)(projectKeyDir);
        // Path for the key
        const keyPath = path.join(projectKeyDir, fileName);
        // Check if the key already exists
        if ((await (0, filesystem_1.fileExists)(keyPath)) && !options.force) {
            throw new Error(`Key file ${keyPath} already exists. Use --force to overwrite.`);
        }
        // Show a spinner while generating the key
        const spinner = (0, ui_1.createSpinner)("Generating SSH key...");
        spinner.start();
        // Generate the key
        await (0, ssh_1.generateKey)(keyPath, {
            type: keyType,
            bits: keyBits,
            kdfRounds,
            passphrase,
            comment,
        });
        // Get the key's fingerprint
        const fingerprint = await (0, ssh_1.getKeyFingerprint)(keyPath);
        spinner.succeed("SSH key generated successfully");
        // Create the SSHKey object
        const sshKey = {
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
        await (0, config_1.addKeyToProject)(projectId, sshKey);
        // Show key details
        (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
            "Key ID": sshKey.id,
            "Key Name": sshKey.name,
            Type: sshKey.type,
            Bits: sshKey.bits,
            Fingerprint: sshKey.fingerprint,
            Path: sshKey.path,
            "Public Key": sshKey.publicKeyPath,
            Created: new Date(sshKey.created).toLocaleString(),
        }), "SSH Key Generated", "green");
        return sshKey;
    }
    catch (error) {
        ui_1.log.error(`Failed to generate SSH key: ${error.message}`);
        throw error;
    }
};
exports.generateSshKey = generateSshKey;
/**
 * List all SSH keys for a project
 */
const listSshKeys = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Check if there are any keys
        if (project.keys.length === 0) {
            ui_1.log.info(`No SSH keys found for project ${projectId}.`);
            return [];
        }
        // Display the keys
        if (!options.json) {
            ui_1.log.info(`SSH keys for project ${project.name} (${projectId}):`);
            const keyStrings = project.keys.map((key, index) => {
                return (0, ui_1.formatKeyValueList)({
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
            (0, ui_1.renderBox)(keyStrings.join("\n\n"), "SSH Keys", "blue");
        }
        return project.keys;
    }
    catch (error) {
        ui_1.log.error(`Failed to list SSH keys: ${error.message}`);
        throw error;
    }
};
exports.listSshKeys = listSshKeys;
/**
 * Delete an SSH key
 */
const deleteSshKey = async (keyId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the key
        const key = project.keys.find((k) => k.id === keyId);
        if (!key) {
            throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
        }
        // Confirm deletion if not in JSON mode
        if (!options.json) {
            const confirmed = await ui_1.prompt.confirm(`Are you sure you want to delete the key "${key.name}" (${key.fingerprint})? This cannot be undone.`, false);
            if (!confirmed) {
                ui_1.log.info("Deletion cancelled.");
                return;
            }
        }
        // Remove the key from the SSH agent if it's loaded
        try {
            await (0, ssh_1.removeKeyFromAgent)(key.path);
        }
        catch (error) {
            // Ignore errors, the key might not be loaded
            ui_1.log.debug(`Failed to remove key from agent: ${error.message}`);
        }
        // Remove the key files if requested
        if (options.removeFiles) {
            try {
                await fs.unlink(key.path);
                await fs.unlink(key.publicKeyPath);
                ui_1.log.success(`Key files deleted: ${key.path}`);
            }
            catch (error) {
                ui_1.log.warn(`Failed to delete key files: ${error.message}`);
            }
        }
        // Remove the key from the project
        await (0, config_1.removeKeyFromProject)(projectId, keyId);
        ui_1.log.success(`Key "${key.name}" deleted from project ${project.name}`);
    }
    catch (error) {
        ui_1.log.error(`Failed to delete SSH key: ${error.message}`);
        throw error;
    }
};
exports.deleteSshKey = deleteSshKey;
/**
 * Get an SSH key by ID
 */
const getSshKey = async (keyId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the key
        const key = project.keys.find((k) => k.id === keyId);
        if (!key) {
            throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
        }
        // Display the key details
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
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
            }), `SSH Key: ${key.name}`, "blue");
        }
        return key;
    }
    catch (error) {
        ui_1.log.error(`Failed to get SSH key: ${error.message}`);
        throw error;
    }
};
exports.getSshKey = getSshKey;
/**
 * Add an SSH key to the agent
 */
const addKeyToAgentCommand = async (keyId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the key
        const key = project.keys.find((k) => k.id === keyId);
        if (!key) {
            throw new Error(`Key with ID ${keyId} not found in project ${projectId}`);
        }
        // Get passphrase if not provided
        let passphrase = options.passphrase;
        if (!passphrase && !options.json) {
            passphrase = await ui_1.prompt.password(`Enter passphrase for key "${key.name}" (leave empty if no passphrase):`);
        }
        // Show a spinner while adding the key
        const spinner = (0, ui_1.createSpinner)(`Adding key "${key.name}" to SSH agent...`);
        spinner.start();
        // Add the key to the agent
        await (0, ssh_1.addKeyToAgent)(key.path, {
            lifetime: options.lifetime,
            passphrase,
        });
        spinner.succeed(`Key "${key.name}" added to SSH agent`);
        // Update the key's last used timestamp
        key.lastUsed = new Date().toISOString();
        await (0, config_1.addKeyToProject)(projectId, key);
    }
    catch (error) {
        ui_1.log.error(`Failed to add key to agent: ${error.message}`);
        throw error;
    }
};
exports.addKeyToAgentCommand = addKeyToAgentCommand;
/**
 * Show the public key
 */
const showPublicKey = async (keyId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
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
                const execAsync = util_1.default.promisify(child_process_1.exec);
                await execAsync("cat /tmp/ssh-key-temp | xclip -selection clipboard");
                await fs.unlink("/tmp/ssh-key-temp");
                ui_1.log.success("Public key copied to clipboard");
            }
            catch (error) {
                ui_1.log.warn(`Failed to copy to clipboard: ${error.message}`);
                ui_1.log.info("Make sure xclip is installed: sudo apt install xclip");
            }
        }
        // Display the public key
        if (!options.json) {
            (0, ui_1.renderBox)(publicKey.trim(), `Public Key: ${key.name}`, "green");
        }
        return publicKey;
    }
    catch (error) {
        ui_1.log.error(`Failed to show public key: ${error.message}`);
        throw error;
    }
};
exports.showPublicKey = showPublicKey;
/**
 * Import an existing SSH key
 */
const importSshKey = async (keyPath, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Check if the private key exists
        if (!(await (0, filesystem_1.fileExists)(keyPath))) {
            throw new Error(`Key file ${keyPath} does not exist`);
        }
        // Check if the public key exists
        const publicKeyPath = `${keyPath}.pub`;
        if (!(await (0, filesystem_1.fileExists)(publicKeyPath))) {
            throw new Error(`Public key file ${publicKeyPath} does not exist`);
        }
        // Generate a name for the key if not provided
        const keyName = options.name || path.basename(keyPath);
        // Generate a unique ID for the key
        const keyId = (0, uuid_1.v7)();
        // Get the key's fingerprint
        const fingerprint = await (0, ssh_1.getKeyFingerprint)(keyPath);
        // Determine the key type
        const publicKey = await fs.readFile(publicKeyPath, "utf8");
        const keyTypeMatch = publicKey.match(/^(ssh-[a-z0-9]+)/);
        const keyType = (keyTypeMatch?.[1] || "unknown");
        // Create a proper destination for the key if copying
        let destKeyPath = keyPath;
        let destPublicKeyPath = publicKeyPath;
        if (options.copy) {
            // Create directory for the project's keys
            const projectKeyDir = path.join(constants_1.KEYS_DIR, projectId);
            await (0, filesystem_1.ensureDirectory)(projectKeyDir);
            // Create a unique file name for the key
            const fileName = (0, ssh_1.generateKeyName)(keyName);
            // Path for the key
            destKeyPath = path.join(projectKeyDir, fileName);
            destPublicKeyPath = `${destKeyPath}.pub`;
            // Copy the key files
            await fs.copy(keyPath, destKeyPath);
            await fs.copy(publicKeyPath, destPublicKeyPath);
            // Set proper permissions
            await fs.chmod(destKeyPath, 0o600);
            await fs.chmod(destPublicKeyPath, 0o644);
            ui_1.log.success(`Key files copied to ${destKeyPath}`);
        }
        // Create the SSHKey object
        const sshKey = {
            id: keyId,
            name: keyName,
            type: keyType,
            path: destKeyPath,
            publicKeyPath: destPublicKeyPath,
            fingerprint,
            created: new Date().toISOString(),
        };
        // Add the key to the project
        await (0, config_1.addKeyToProject)(projectId, sshKey);
        // Show key details
        (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
            "Key ID": sshKey.id,
            "Key Name": sshKey.name,
            Type: sshKey.type,
            Fingerprint: sshKey.fingerprint,
            Path: sshKey.path,
            "Public Key": sshKey.publicKeyPath,
            Created: new Date(sshKey.created).toLocaleString(),
        }), "SSH Key Imported", "green");
        return sshKey;
    }
    catch (error) {
        ui_1.log.error(`Failed to import SSH key: ${error.message}`);
        throw error;
    }
};
exports.importSshKey = importSshKey;
//# sourceMappingURL=key-manager.js.map