import { AgentStatus, AgentKey, CommandOptions } from "../types";
import {
  startAgent,
  stopAgent,
  getAgentStatus,
  addKeyToAgent,
  removeKeyFromAgent,
  removeAllKeysFromAgent,
} from "../utils/ssh";
import { loadProject, getActiveProject } from "../utils/config";
import {
  log,
  prompt,
  createSpinner,
  renderBox,
  formatKeyValueList,
} from "../utils/ui";
import * as fs from "fs-extra";
import { DEFAULT_AGENT_TIMEOUT } from "../constants";

/**
 * Start the SSH agent
 */
export const startSshAgent = async (
  options: {
    setEnv?: boolean;
  } & CommandOptions
): Promise<void> => {
  try {
    // Check if agent is already running
    const status = await getAgentStatus();

    if (status.running) {
      log.info("SSH agent is already running");
      log.info(`SSH_AUTH_SOCK=${status.socket}`);
      log.info(`SSH_AGENT_PID=${status.pid}`);
      return;
    }

    // Show a spinner while starting the agent
    const spinner = createSpinner("Starting SSH agent...");
    spinner.start();

    // Start the agent
    const { agentPid, sshAuthSock } = await startAgent();

    spinner.succeed("SSH agent started successfully");

    // Show agent details
    renderBox(
      formatKeyValueList({
        SSH_AUTH_SOCK: sshAuthSock,
        SSH_AGENT_PID: agentPid,
      }),
      "SSH Agent Started",
      "green"
    );

    // Print commands to set environment variables if requested
    if (options.setEnv) {
      log.info("Run the following commands to set the environment variables:");
      log.info(`export SSH_AUTH_SOCK=${sshAuthSock}`);
      log.info(`export SSH_AGENT_PID=${agentPid}`);
    }
  } catch (error: any) {
    log.error(`Failed to start SSH agent: ${error.message}`);
    throw error;
  }
};

/**
 * Stop the SSH agent
 */
export const stopSshAgent = async (
  options: CommandOptions = {}
): Promise<void> => {
  try {
    // Check if agent is running
    const status = await getAgentStatus();

    if (!status.running) {
      log.info("SSH agent is not running");
      return;
    }

    // Confirm stopping if not in JSON mode
    if (!options.json) {
      const confirmed = await prompt.confirm(
        "Are you sure you want to stop the SSH agent? All loaded keys will be unloaded.",
        false
      );

      if (!confirmed) {
        log.info("Operation cancelled.");
        return;
      }
    }

    // Show a spinner while stopping the agent
    const spinner = createSpinner("Stopping SSH agent...");
    spinner.start();

    // Stop the agent
    await stopAgent();

    spinner.succeed("SSH agent stopped successfully");
  } catch (error: any) {
    log.error(`Failed to stop SSH agent: ${error.message}`);
    throw error;
  }
};

/**
 * Get the status of the SSH agent
 */
export const getSshAgentStatus = async (
  options: CommandOptions = {}
): Promise<AgentStatus> => {
  try {
    const status = await getAgentStatus();

    if (!options.json) {
      if (status.running) {
        renderBox(
          formatKeyValueList({
            Status: "Running",
            SSH_AUTH_SOCK: status.socket,
            SSH_AGENT_PID: status.pid,
            "Loaded Keys": status.keys?.length || 0,
          }),
          "SSH Agent Status",
          "blue"
        );

        // Show detailed key information if there are any keys
        if (status.keys && status.keys.length > 0) {
          log.info("Loaded Keys:");

          status.keys.forEach((key, index) => {
            log.info(
              `  ${index + 1}. ${key.fingerprint} (${key.type}) ${
                key.comment || ""
              }`
            );
          });
        }
      } else {
        renderBox(
          formatKeyValueList({
            Status: "Not Running",
          }),
          "SSH Agent Status",
          "yellow"
        );
      }
    }

    return status;
  } catch (error: any) {
    log.error(`Failed to get SSH agent status: ${error.message}`);
    throw error;
  }
};

/**
 * Add all project keys to the SSH agent
 */
export const addProjectKeysToAgent = async (
  options: {
    projectId?: string;
    lifetime?: number;
  } & CommandOptions
): Promise<void> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Check if there are any keys
    if (project.keys.length === 0) {
      log.info(`No SSH keys found for project ${projectId}.`);
      return;
    }

    // Check if agent is running, start it if not
    const status = await getAgentStatus();
    if (!status.running) {
      log.info("SSH agent is not running. Starting...");
      await startSshAgent(options);
    }

    // Show a spinner while adding keys
    const spinner = createSpinner(
      `Adding ${project.keys.length} keys to SSH agent...`
    );
    spinner.start();

    // Add each key to the agent
    const lifetime = options.lifetime || DEFAULT_AGENT_TIMEOUT;
    let addedCount = 0;

    for (const key of project.keys) {
      try {
        // Check if the key file exists
        if (await fs.pathExists(key.path)) {
          await addKeyToAgent(key.path, { lifetime });
          addedCount++;

          // Update the key's last used timestamp
          key.lastUsed = new Date().toISOString();
        } else {
          log.warn(`Key file not found: ${key.path}`);
        }
      } catch (error: any) {
        log.warn(`Failed to add key ${key.name}: ${error.message}`);
      }
    }

    // Save the project with updated last used timestamps
    if (addedCount > 0) {
      await loadProject(projectId);
    }

    spinner.succeed(`Added ${addedCount} keys to SSH agent`);
  } catch (error: any) {
    log.error(`Failed to add project keys to agent: ${error.message}`);
    throw error;
  }
};

/**
 * Remove all keys from the SSH agent
 */
export const removeAllKeysFromAgentCommand = async (
  options: CommandOptions = {}
): Promise<void> => {
  try {
    // Check if agent is running
    const status = await getAgentStatus();

    if (!status.running) {
      log.info("SSH agent is not running");
      return;
    }

    // Check if there are any keys
    if (!status.keys || status.keys.length === 0) {
      log.info("No keys are loaded in the SSH agent");
      return;
    }

    // Confirm removal if not in JSON mode
    if (!options.json) {
      const confirmed = await prompt.confirm(
        `Are you sure you want to remove all ${status.keys.length} keys from the SSH agent?`,
        false
      );

      if (!confirmed) {
        log.info("Operation cancelled.");
        return;
      }
    }

    // Show a spinner while removing keys
    const spinner = createSpinner("Removing all keys from SSH agent...");
    spinner.start();

    // Remove all keys
    await removeAllKeysFromAgent();

    spinner.succeed("All keys removed from SSH agent");
  } catch (error: any) {
    log.error(`Failed to remove keys from agent: ${error.message}`);
    throw error;
  }
};

/**
 * Generate an SSH agent startup script
 */
export const generateAgentStartupScript = async (
  options: {
    outputPath?: string;
    projectId?: string;
    lifetime?: number;
  } & CommandOptions
): Promise<string> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Default output path
    const outputPath =
      options.outputPath || `${process.env.HOME}/.ssh-manager-agent.sh`;

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
  ${
    options.lifetime
      ? `# Keys will expire after ${options.lifetime} seconds`
      : "# Keys will not expire"
  }
  SSH_MANAGER_DIR="${process.env.HOME}/.ssh-manager"
  
  # Check if the ssh-manager CLI is available
  if command -v ssh-manager &> /dev/null; then
    echo "Adding keys from project ${projectId}..."
    ssh-manager agent add-project-keys --project ${projectId} ${
      options.lifetime ? `--lifetime ${options.lifetime}` : ""
    }
  else
    echo "ssh-manager CLI not found. You need to install it to use this script."
  fi
  
  echo "SSH agent ready with keys from project ${projectId}"
  `;

    // Write the script to file
    await fs.writeFile(outputPath, scriptContent);
    await fs.chmod(outputPath, 0o755);

    log.success(`SSH agent startup script generated: ${outputPath}`);
    log.info("To use this script:");
    log.info(`  1. Add "source ${outputPath}" to your ~/.bashrc or ~/.zshrc`);
    log.info("  2. Restart your shell or run the script manually");

    return outputPath;
  } catch (error: any) {
    log.error(`Failed to generate agent startup script: ${error.message}`);
    throw error;
  }
};

/**
 * Export agent environment variables to a file
 */
export const exportAgentEnvironment = async (
  options: {
    outputPath?: string;
  } & CommandOptions
): Promise<void> => {
  try {
    // Check if agent is running
    const status = await getAgentStatus();

    if (!status.running) {
      throw new Error("SSH agent is not running");
    }

    // Default output path
    const outputPath =
      options.outputPath || `${process.env.HOME}/.ssh-agent-env`;

    // Create the environment file content
    const envContent = `# SSH Agent environment variables exported by ssh-manager
  # Generated: ${new Date().toISOString()}
  export SSH_AUTH_SOCK=${status.socket}
  export SSH_AGENT_PID=${status.pid}
  `;

    // Write the environment file
    await fs.writeFile(outputPath, envContent);

    log.success(`SSH agent environment exported: ${outputPath}`);
    log.info("To use these environment variables:");
    log.info(`  source ${outputPath}`);
  } catch (error: any) {
    log.error(`Failed to export agent environment: ${error.message}`);
    throw error;
  }
};
