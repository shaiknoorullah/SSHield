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
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAgentEnvironment = exports.generateAgentStartupScript = exports.removeAllKeysFromAgentCommand = exports.addProjectKeysToAgent = exports.getSshAgentStatus = exports.stopSshAgent = exports.startSshAgent = void 0;
const ssh_1 = require("../utils/ssh");
const config_1 = require("../utils/config");
const ui_1 = require("../utils/ui");
const fs = __importStar(require("fs-extra"));
const constants_1 = require("../constants");
/**
 * Start the SSH agent
 */
const startSshAgent = async (options) => {
    try {
        // Check if agent is already running
        const status = await (0, ssh_1.getAgentStatus)();
        if (status.running) {
            ui_1.log.info("SSH agent is already running");
            ui_1.log.info(`SSH_AUTH_SOCK=${status.socket}`);
            ui_1.log.info(`SSH_AGENT_PID=${status.pid}`);
            return;
        }
        // Show a spinner while starting the agent
        const spinner = (0, ui_1.createSpinner)("Starting SSH agent...");
        spinner.start();
        // Start the agent
        const { agentPid, sshAuthSock } = await (0, ssh_1.startAgent)();
        spinner.succeed("SSH agent started successfully");
        // Show agent details
        (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
            SSH_AUTH_SOCK: sshAuthSock,
            SSH_AGENT_PID: agentPid,
        }), "SSH Agent Started", "green");
        // Print commands to set environment variables if requested
        if (options.setEnv) {
            ui_1.log.info("Run the following commands to set the environment variables:");
            ui_1.log.info(`export SSH_AUTH_SOCK=${sshAuthSock}`);
            ui_1.log.info(`export SSH_AGENT_PID=${agentPid}`);
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to start SSH agent: ${error.message}`);
        throw error;
    }
};
exports.startSshAgent = startSshAgent;
/**
 * Stop the SSH agent
 */
const stopSshAgent = async (options = {}) => {
    try {
        // Check if agent is running
        const status = await (0, ssh_1.getAgentStatus)();
        if (!status.running) {
            ui_1.log.info("SSH agent is not running");
            return;
        }
        // Confirm stopping if not in JSON mode
        if (!options.json) {
            const confirmed = await ui_1.prompt.confirm("Are you sure you want to stop the SSH agent? All loaded keys will be unloaded.", false);
            if (!confirmed) {
                ui_1.log.info("Operation cancelled.");
                return;
            }
        }
        // Show a spinner while stopping the agent
        const spinner = (0, ui_1.createSpinner)("Stopping SSH agent...");
        spinner.start();
        // Stop the agent
        await (0, ssh_1.stopAgent)();
        spinner.succeed("SSH agent stopped successfully");
    }
    catch (error) {
        ui_1.log.error(`Failed to stop SSH agent: ${error.message}`);
        throw error;
    }
};
exports.stopSshAgent = stopSshAgent;
/**
 * Get the status of the SSH agent
 */
const getSshAgentStatus = async (options = {}) => {
    try {
        const status = await (0, ssh_1.getAgentStatus)();
        if (!options.json) {
            if (status.running) {
                (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                    Status: "Running",
                    SSH_AUTH_SOCK: status.socket,
                    SSH_AGENT_PID: status.pid,
                    "Loaded Keys": status.keys?.length || 0,
                }), "SSH Agent Status", "blue");
                // Show detailed key information if there are any keys
                if (status.keys && status.keys.length > 0) {
                    ui_1.log.info("Loaded Keys:");
                    status.keys.forEach((key, index) => {
                        ui_1.log.info(`  ${index + 1}. ${key.fingerprint} (${key.type}) ${key.comment || ""}`);
                    });
                }
            }
            else {
                (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                    Status: "Not Running",
                }), "SSH Agent Status", "yellow");
            }
        }
        return status;
    }
    catch (error) {
        ui_1.log.error(`Failed to get SSH agent status: ${error.message}`);
        throw error;
    }
};
exports.getSshAgentStatus = getSshAgentStatus;
/**
 * Add all project keys to the SSH agent
 */
const addProjectKeysToAgent = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Check if there are any keys
        if (project.keys.length === 0) {
            ui_1.log.info(`No SSH keys found for project ${projectId}.`);
            return;
        }
        // Check if agent is running, start it if not
        const status = await (0, ssh_1.getAgentStatus)();
        if (!status.running) {
            ui_1.log.info("SSH agent is not running. Starting...");
            await (0, exports.startSshAgent)(options);
        }
        // Show a spinner while adding keys
        const spinner = (0, ui_1.createSpinner)(`Adding ${project.keys.length} keys to SSH agent...`);
        spinner.start();
        // Add each key to the agent
        const lifetime = options.lifetime || constants_1.DEFAULT_AGENT_TIMEOUT;
        let addedCount = 0;
        for (const key of project.keys) {
            try {
                // Check if the key file exists
                if (await fs.pathExists(key.path)) {
                    await (0, ssh_1.addKeyToAgent)(key.path, { lifetime });
                    addedCount++;
                    // Update the key's last used timestamp
                    key.lastUsed = new Date().toISOString();
                }
                else {
                    ui_1.log.warn(`Key file not found: ${key.path}`);
                }
            }
            catch (error) {
                ui_1.log.warn(`Failed to add key ${key.name}: ${error.message}`);
            }
        }
        // Save the project with updated last used timestamps
        if (addedCount > 0) {
            await (0, config_1.loadProject)(projectId);
        }
        spinner.succeed(`Added ${addedCount} keys to SSH agent`);
    }
    catch (error) {
        ui_1.log.error(`Failed to add project keys to agent: ${error.message}`);
        throw error;
    }
};
exports.addProjectKeysToAgent = addProjectKeysToAgent;
/**
 * Remove all keys from the SSH agent
 */
const removeAllKeysFromAgentCommand = async (options = {}) => {
    try {
        // Check if agent is running
        const status = await (0, ssh_1.getAgentStatus)();
        if (!status.running) {
            ui_1.log.info("SSH agent is not running");
            return;
        }
        // Check if there are any keys
        if (!status.keys || status.keys.length === 0) {
            ui_1.log.info("No keys are loaded in the SSH agent");
            return;
        }
        // Confirm removal if not in JSON mode
        if (!options.json) {
            const confirmed = await ui_1.prompt.confirm(`Are you sure you want to remove all ${status.keys.length} keys from the SSH agent?`, false);
            if (!confirmed) {
                ui_1.log.info("Operation cancelled.");
                return;
            }
        }
        // Show a spinner while removing keys
        const spinner = (0, ui_1.createSpinner)("Removing all keys from SSH agent...");
        spinner.start();
        // Remove all keys
        await (0, ssh_1.removeAllKeysFromAgent)();
        spinner.succeed("All keys removed from SSH agent");
    }
    catch (error) {
        ui_1.log.error(`Failed to remove keys from agent: ${error.message}`);
        throw error;
    }
};
exports.removeAllKeysFromAgentCommand = removeAllKeysFromAgentCommand;
/**
 * Generate an SSH agent startup script
 */
const generateAgentStartupScript = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Default output path
        const outputPath = options.outputPath || `${process.env.HOME}/.ssh-manager-agent.sh`;
        // Create the script content
        const scriptContent = `#!/bin/bash
  # SSH Agent startup script generated by ssh-manager
  # Project: ${projectId}
  # Generated: ${new Date().toISOString()}
  
  # Start the SSH agent if not already running
  if [ -z "$SSH_AUTH_SOCK" ]; then
    echo "Starting SSH agent..."
    eval "$(ssh-agent -s)"
  fi
  
  # Add keys to the agent
  ${options.lifetime
            ? `# Keys will expire after ${options.lifetime} seconds`
            : "# Keys will not expire"}
  SSH_MANAGER_DIR="${process.env.HOME}/.ssh-manager"
  
  # Check if the ssh-manager CLI is available
  if command -v ssh-manager &> /dev/null; then
    echo "Adding keys from project ${projectId}..."
    ssh-manager agent add-project-keys --project ${projectId} ${options.lifetime ? `--lifetime ${options.lifetime}` : ""}
  else
    echo "ssh-manager CLI not found. You need to install it to use this script."
  fi
  
  echo "SSH agent ready with keys from project ${projectId}"
  `;
        // Write the script to file
        await fs.writeFile(outputPath, scriptContent);
        await fs.chmod(outputPath, 0o755);
        ui_1.log.success(`SSH agent startup script generated: ${outputPath}`);
        ui_1.log.info("To use this script:");
        ui_1.log.info(`  1. Add "source ${outputPath}" to your ~/.bashrc or ~/.zshrc`);
        ui_1.log.info("  2. Restart your shell or run the script manually");
        return outputPath;
    }
    catch (error) {
        ui_1.log.error(`Failed to generate agent startup script: ${error.message}`);
        throw error;
    }
};
exports.generateAgentStartupScript = generateAgentStartupScript;
/**
 * Export agent environment variables to a file
 */
const exportAgentEnvironment = async (options) => {
    try {
        // Check if agent is running
        const status = await (0, ssh_1.getAgentStatus)();
        if (!status.running) {
            throw new Error("SSH agent is not running");
        }
        // Default output path
        const outputPath = options.outputPath || `${process.env.HOME}/.ssh-agent-env`;
        // Create the environment file content
        const envContent = `# SSH Agent environment variables exported by ssh-manager
  # Generated: ${new Date().toISOString()}
  export SSH_AUTH_SOCK=${status.socket}
  export SSH_AGENT_PID=${status.pid}
  `;
        // Write the environment file
        await fs.writeFile(outputPath, envContent);
        ui_1.log.success(`SSH agent environment exported: ${outputPath}`);
        ui_1.log.info("To use these environment variables:");
        ui_1.log.info(`  source ${outputPath}`);
    }
    catch (error) {
        ui_1.log.error(`Failed to export agent environment: ${error.message}`);
        throw error;
    }
};
exports.exportAgentEnvironment = exportAgentEnvironment;
//# sourceMappingURL=agent.js.map