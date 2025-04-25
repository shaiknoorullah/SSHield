#!/usr/bin/env node

import { Command } from "commander";
import { APP_NAME, APP_VERSION } from "./constants";
import { renderTitle, log } from "./utils/ui";

// Import command modules
import {
  initializeApplication,
  isInitialized,
  showStatus,
} from "./commands/init";
import {
  generateSshKey,
  listSshKeys,
  deleteSshKey,
  getSshKey,
  addKeyToAgentCommand,
  showPublicKey,
  importSshKey,
} from "./commands/key-manager";
import {
  createNewProject,
  listAllProjects,
  setActiveProjectCommand,
  getProjectDetails,
  updateProject,
  deleteProjectCommand,
  updateSshConfigWithProjectCommand,
  exportProject,
  importProject,
} from "./commands/project";
import {
  startSshAgent,
  stopSshAgent,
  getSshAgentStatus,
  addProjectKeysToAgent,
  removeAllKeysFromAgentCommand,
  generateAgentStartupScript,
  exportAgentEnvironment,
} from "./commands/agent";
import {
  addServer,
  listServers,
  deleteServer,
  connectToServerCommand,
  createTunnel,
  openSshSession,
  generateSshCommand,
} from "./commands/connection";
import { getActiveProject } from "./utils/config";

// Create the command line interface
const program = new Command();

// Configure the program
program
  .name(APP_NAME)
  .description("Secure SSH key management with project-based namespaces")
  .version(APP_VERSION)
  .option("-v, --verbose", "Show verbose output")
  .option("-j, --json", "Output in JSON format")
  .hook("preAction", async (thisCommand) => {
    // Skip initialization check for init command
    if (thisCommand.name() === "init") {
      return;
    }

    // Check if the application is initialized
    if (!(await isInitialized())) {
      log.error(
        "Application is not initialized. Run `ssh-manager init` to set up."
      );
      process.exit(1);
    }
  });

// Initialize command
program
  .command("init")
  .description("Initialize the application")
  .option("-f, --force", "Force initialization even if already initialized")
  .option("-p, --project-name <name>", "Name for the first project")
  .option("--skip-intro", "Skip the introduction")
  .action(async (options) => {
    try {
      await initializeApplication(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command("status")
  .description("Show application status")
  .action(async (options) => {
    try {
      await showStatus(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// Key management commands
const keyCommand = program.command("key").description("Manage SSH keys");

keyCommand
  .command("generate")
  .description("Generate a new SSH key")
  .option("-p, --project <id>", "Project ID")
  .option("-n, --name <name>", "Key name")
  .option("-t, --type <type>", "Key type (ed25519, ecdsa, rsa)")
  .option("-b, --bits <bits>", "Key bits (for RSA)")
  .option("-a, --kdf-rounds <rounds>", "KDF rounds")
  .option("-c, --comment <comment>", "Key comment")
  .option("-f, --force", "Force overwrite if key already exists")
  .action(async (options) => {
    try {
      await generateSshKey(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

keyCommand
  .command("list")
  .description("List SSH keys")
  .option("-p, --project <id>", "Project ID")
  .action(async (options) => {
    try {
      await listSshKeys(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

keyCommand
  .command("delete <key-id>")
  .description("Delete an SSH key")
  .option("-p, --project <id>", "Project ID")
  .option("-r, --remove-files", "Remove key files")
  .action(async (keyId, options) => {
    try {
      await deleteSshKey(keyId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

keyCommand
  .command("show <key-id>")
  .description("Show SSH key details")
  .option("-p, --project <id>", "Project ID")
  .action(async (keyId, options) => {
    try {
      await getSshKey(keyId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

keyCommand
  .command("public <key-id>")
  .description("Show SSH public key")
  .option("-p, --project <id>", "Project ID")
  .option("-c, --clipboard", "Copy to clipboard")
  .action(async (keyId, options) => {
    try {
      await showPublicKey(keyId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

keyCommand
  .command("add <key-id>")
  .description("Add SSH key to agent")
  .option("-p, --project <id>", "Project ID")
  .option("-t, --lifetime <seconds>", "Key lifetime in seconds")
  .action(async (keyId, options) => {
    try {
      await addKeyToAgentCommand(keyId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

keyCommand
  .command("import <key-path>")
  .description("Import an existing SSH key")
  .option("-p, --project <id>", "Project ID")
  .option("-n, --name <name>", "Key name")
  .option("-c, --copy", "Copy the key instead of referencing it")
  .action(async (keyPath, options) => {
    try {
      await importSshKey(keyPath, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// Project management commands
const projectCommand = program
  .command("project")
  .description("Manage projects");

projectCommand
  .command("create <name>")
  .description("Create a new project")
  .option("-d, --description <text>", "Project description")
  .option("-a, --activate", "Set as active project")
  .action(async (name, options) => {
    try {
      await createNewProject(name, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("list")
  .description("List all projects")
  .action(async (options) => {
    try {
      await listAllProjects(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("set-active <project-id>")
  .description("Set active project")
  .action(async (projectId, options) => {
    try {
      await setActiveProjectCommand(projectId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("show [project-id]")
  .description("Show project details")
  .action(async (projectId, options) => {
    try {
      if (!projectId) {
        // If no project ID is provided, use the active project
        projectId = await getActiveProject();
      }
      await getProjectDetails(projectId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("update <project-id>")
  .description("Update project details")
  .option("-n, --name <name>", "Project name")
  .option("-d, --description <text>", "Project description")
  .action(async (projectId, options) => {
    try {
      await updateProject(projectId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("delete <project-id>")
  .description("Delete a project")
  .action(async (projectId, options) => {
    try {
      await deleteProjectCommand(projectId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("update-ssh-config [project-id]")
  .description("Update SSH config with project servers")
  .action(async (projectId, options) => {
    try {
      await updateSshConfigWithProjectCommand({ projectId, ...options });
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("export <project-id>")
  .description("Export project data")
  .option("-o, --output-path <path>", "Output file path")
  .option("-k, --include-keys", "Include sensitive key information")
  .action(async (projectId, options) => {
    try {
      await exportProject(projectId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

projectCommand
  .command("import <import-path>")
  .description("Import project data")
  .option("-o, --overwrite", "Overwrite existing project")
  .action(async (importPath, options) => {
    try {
      await importProject(importPath, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// Agent management commands
const agentCommand = program.command("agent").description("Manage SSH agent");

agentCommand
  .command("start")
  .description("Start the SSH agent")
  .option("-e, --set-env", "Show commands to set environment variables")
  .action(async (options) => {
    try {
      await startSshAgent(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

agentCommand
  .command("stop")
  .description("Stop the SSH agent")
  .action(async (options) => {
    try {
      await stopSshAgent(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

agentCommand
  .command("status")
  .description("Show SSH agent status")
  .action(async (options) => {
    try {
      await getSshAgentStatus(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

agentCommand
  .command("add-project-keys")
  .description("Add all project keys to the SSH agent")
  .option("-p, --project <id>", "Project ID")
  .option("-t, --lifetime <seconds>", "Key lifetime in seconds")
  .action(async (options) => {
    try {
      await addProjectKeysToAgent(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

agentCommand
  .command("remove-all-keys")
  .description("Remove all keys from the SSH agent")
  .action(async (options) => {
    try {
      await removeAllKeysFromAgentCommand(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

agentCommand
  .command("generate-startup-script")
  .description("Generate an SSH agent startup script")
  .option("-o, --output-path <path>", "Output file path")
  .option("-p, --project <id>", "Project ID")
  .option("-t, --lifetime <seconds>", "Key lifetime in seconds")
  .action(async (options) => {
    try {
      await generateAgentStartupScript(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

agentCommand
  .command("export-env")
  .description("Export agent environment variables to a file")
  .option("-o, --output-path <path>", "Output file path")
  .action(async (options) => {
    try {
      await exportAgentEnvironment(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// Server management commands
const serverCommand = program.command("server").description("Manage servers");

serverCommand
  .command("add")
  .description("Add a server to a project")
  .option("-p, --project <id>", "Project ID")
  .option("-n, --name <name>", "Server name")
  .option("-h, --hostname <hostname>", "Server hostname")
  .option("--port <port>", "Server port")
  .option("-u, --username <username>", "Username")
  .option("-k, --key-id <key-id>", "SSH key ID")
  .option("-t, --test-connection", "Test connection")
  .action(async (options) => {
    try {
      // Require name, hostname, and username
      if (!options.name) {
        throw new Error("Server name is required");
      }
      if (!options.hostname) {
        throw new Error("Server hostname is required");
      }
      if (!options.username) {
        throw new Error("Username is required");
      }

      await addServer(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

serverCommand
  .command("list")
  .description("List servers")
  .option("-p, --project <id>", "Project ID")
  .action(async (options) => {
    try {
      await listServers(options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

serverCommand
  .command("delete <server-id>")
  .description("Delete a server")
  .option("-p, --project <id>", "Project ID")
  .action(async (serverId, options) => {
    try {
      await deleteServer(serverId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// Connection commands
program
  .command("connect <server-name-or-id>")
  .description("Connect to a server")
  .option("-p, --project <id>", "Project ID")
  .option("-c, --command <command>", "Command to execute")
  .action(async (serverNameOrId, options) => {
    try {
      await openSshSession(serverNameOrId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

program
  .command("tunnel <server-name-or-id>")
  .description("Create an SSH tunnel")
  .option("-p, --project <id>", "Project ID")
  .option("-l, --local-port <port>", "Local port")
  .option("-r, --remote-host <hostname>", "Remote hostname")
  .option("-P, --remote-port <port>", "Remote port")
  .action(async (serverNameOrId, options) => {
    try {
      // Require remote host and port
      if (!options.remoteHost) {
        throw new Error("Remote hostname is required");
      }
      if (!options.remotePort) {
        throw new Error("Remote port is required");
      }

      await createTunnel(serverNameOrId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

program
  .command("ssh-command <server-name-or-id>")
  .description("Generate an SSH command for a server")
  .option("-p, --project <id>", "Project ID")
  .option("-c, --command <command>", "Command to execute")
  .option("-k, --with-key", "Include key path in command")
  .action(async (serverNameOrId, options) => {
    try {
      await generateSshCommand(serverNameOrId, options);
    } catch (error: any) {
      log.error(error.message);
      process.exit(1);
    }
  });

// TUI dashboard command
program
  .command("dashboard")
  .description("Open the interactive dashboard")
  .action(async () => {
    // This will be implemented separately with a TUI library
    log.info("Interactive dashboard coming soon!");
  });

// Execute the program
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error: any) {
    log.error(error.message);
    process.exit(1);
  }
}

main();
