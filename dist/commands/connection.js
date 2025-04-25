"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSshCommand = exports.openSshSession = exports.createTunnel = exports.connectToServerCommand = exports.deleteServer = exports.listServers = exports.addServer = void 0;
const uuid_1 = require("uuid");
const ssh_1 = require("../utils/ssh");
const config_1 = require("../utils/config");
const ui_1 = require("../utils/ui");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Add a server to a project
 */
const addServer = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Check if server with the same name already exists
        if (project.servers.some((s) => s.name === options.name)) {
            throw new Error(`Server with name ${options.name} already exists in project ${projectId}`);
        }
        // Generate a unique ID for the server
        const serverId = (0, uuid_1.v4)();
        // Create server config
        const serverConfig = {
            id: serverId,
            name: options.name,
            hostname: options.hostname,
            port: options.port || 22,
            username: options.username,
            keyId: options.keyId || "",
            options: {
                ServerAliveInterval: "60",
                ServerAliveCountMax: "120",
            },
        };
        // Test connection if requested
        if (options.testConnection) {
            const spinner = (0, ui_1.createSpinner)(`Testing connection to ${options.hostname}...`);
            spinner.start();
            // If a key ID is provided, find the corresponding key
            let keyPath = "";
            if (options.keyId) {
                const key = project.keys.find((k) => k.id === options.keyId);
                if (key) {
                    keyPath = key.path;
                }
            }
            const success = await (0, ssh_1.testConnection)(options.hostname, {
                username: options.username,
                port: options.port || 22,
                keyPath,
            });
            if (success) {
                spinner.succeed(`Connection to ${options.hostname} successful`);
            }
            else {
                spinner.fail(`Connection to ${options.hostname} failed`);
                // Ask whether to continue if not in JSON mode
                if (!options.json) {
                    const continue_ = await ui_1.prompt.confirm("Connection test failed. Add the server anyway?", false);
                    if (!continue_) {
                        ui_1.log.info("Operation cancelled.");
                        throw new Error("Connection test failed");
                    }
                }
            }
        }
        // Add the server to the project
        const updatedProject = await (0, config_1.addServerToProject)(projectId, serverConfig);
        // Show success message
        ui_1.log.success(`Server "${options.name}" added to project ${project.name}`);
        // Show server details
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                "Server ID": serverConfig.id,
                Name: serverConfig.name,
                Hostname: serverConfig.hostname,
                Port: serverConfig.port,
                Username: serverConfig.username,
                "SSH Key": serverConfig.keyId
                    ? updatedProject.keys.find((k) => k.id === serverConfig.keyId)
                        ?.name || serverConfig.keyId
                    : "None",
            }), "Server Added", "green");
        }
        // Ask if the user wants to update SSH config
        if (!options.json) {
            const updateConfig = await ui_1.prompt.confirm("Do you want to update your SSH config with this server?", true);
            if (updateConfig) {
                await (0, config_1.updateSshConfigWithProject)(projectId);
            }
        }
        return serverConfig;
    }
    catch (error) {
        ui_1.log.error(`Failed to add server: ${error.message}`);
        throw error;
    }
};
exports.addServer = addServer;
/**
 * List servers in a project
 */
const listServers = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Check if there are any servers
        if (project.servers.length === 0) {
            ui_1.log.info(`No servers found in project ${project.name}`);
            return [];
        }
        // Show server list
        if (!options.json) {
            ui_1.log.info(`Servers in project ${project.name} (${projectId}):`);
            const serverStrings = project.servers.map((server) => {
                const key = project.keys.find((k) => k.id === server.keyId);
                return (0, ui_1.formatKeyValueList)({
                    "Server ID": server.id,
                    Name: server.name,
                    Hostname: server.hostname,
                    Port: server.port,
                    Username: server.username,
                    "SSH Key": key ? key.name : "None",
                });
            });
            (0, ui_1.renderBox)(serverStrings.join("\n\n"), "Servers", "blue");
        }
        return project.servers;
    }
    catch (error) {
        ui_1.log.error(`Failed to list servers: ${error.message}`);
        throw error;
    }
};
exports.listServers = listServers;
/**
 * Delete a server from a project
 */
const deleteServer = async (serverId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the server
        const server = project.servers.find((s) => s.id === serverId);
        if (!server) {
            throw new Error(`Server with ID ${serverId} not found in project ${projectId}`);
        }
        // Confirm deletion if not in JSON mode
        if (!options.json) {
            const confirmed = await ui_1.prompt.confirm(`Are you sure you want to delete server "${server.name}" (${server.hostname})? This cannot be undone.`, false);
            if (!confirmed) {
                ui_1.log.info("Deletion cancelled.");
                return;
            }
        }
        // Show a spinner while deleting the server
        const spinner = (0, ui_1.createSpinner)(`Deleting server "${server.name}"...`);
        spinner.start();
        // Remove the server from the project
        await (0, config_1.removeServerFromProject)(projectId, serverId);
        spinner.succeed(`Server "${server.name}" deleted from project ${project.name}`);
        // Ask if the user wants to update SSH config
        if (!options.json) {
            const updateConfig = await ui_1.prompt.confirm("Do you want to update your SSH config to remove this server?", true);
            if (updateConfig) {
                await (0, config_1.updateSshConfigWithProject)(projectId);
            }
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to delete server: ${error.message}`);
        throw error;
    }
};
exports.deleteServer = deleteServer;
/**
 * Connect to a server
 */
const connectToServerCommand = async (serverNameOrId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the server by name or ID
        const server = project.servers.find((s) => s.id === serverNameOrId || s.name === serverNameOrId);
        if (!server) {
            throw new Error(`Server "${serverNameOrId}" not found in project ${projectId}`);
        }
        // Find the key for this server
        const key = server.keyId
            ? project.keys.find((k) => k.id === server.keyId)
            : null;
        // Show a spinner while connecting
        const spinner = (0, ui_1.createSpinner)(`Connecting to ${server.hostname}...`);
        spinner.start();
        // Connect to the server
        const ssh = await (0, ssh_1.connectToServer)(server.hostname, {
            username: server.username,
            port: server.port,
            keyPath: key?.path,
            command: options.command,
        });
        spinner.succeed(`Connected to ${server.hostname}`);
        // Update server last used timestamp
        server.lastUsed = new Date().toISOString();
        await (0, config_1.addServerToProject)(projectId, server);
        // Execute any additional logic here if needed
        // After a delay, close the connection
        setTimeout(() => {
            ssh.dispose();
            ui_1.log.info(`Disconnected from ${server.hostname}`);
        }, 5000);
    }
    catch (error) {
        ui_1.log.error(`Failed to connect to server: ${error.message}`);
        throw error;
    }
};
exports.connectToServerCommand = connectToServerCommand;
/**
 * Create an SSH tunnel
 */
const createTunnel = async (serverNameOrId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the server by name or ID
        const server = project.servers.find((s) => s.id === serverNameOrId || s.name === serverNameOrId);
        if (!server) {
            throw new Error(`Server "${serverNameOrId}" not found in project ${projectId}`);
        }
        // Find the key for this server
        const key = server.keyId
            ? project.keys.find((k) => k.id === server.keyId)
            : null;
        // Generate a random local port if not specified
        const localPort = options.localPort || (0, ssh_1.generateRandomPort)();
        // Show a spinner while creating the tunnel
        const spinner = (0, ui_1.createSpinner)(`Creating SSH tunnel: localhost:${localPort} -> ${options.remoteHost}:${options.remotePort} via ${server.hostname}...`);
        spinner.start();
        // Create the tunnel
        const tunnel = await (0, ssh_1.createSshTunnel)({
            localPort,
            remoteHost: options.remoteHost,
            remotePort: options.remotePort,
            sshHost: server.hostname,
            sshPort: server.port,
            sshUser: server.username,
            keyPath: key?.path,
        });
        spinner.succeed(`SSH tunnel created: localhost:${localPort} -> ${options.remoteHost}:${options.remotePort} via ${server.hostname}`);
        // Notify the user
        (0, ui_1.notify)("SSH Tunnel Created", `Tunnel: localhost:${localPort} -> ${options.remoteHost}:${options.remotePort}`, "success");
        // Keep the process running
        ui_1.log.info("Press Ctrl+C to close the tunnel");
        // Handle process termination
        process.on("SIGINT", () => {
            ui_1.log.info("Closing SSH tunnel...");
            (0, ssh_1.closeSshTunnel)(tunnel.process);
            process.exit(0);
        });
    }
    catch (error) {
        ui_1.log.error(`Failed to create SSH tunnel: ${error.message}`);
        throw error;
    }
};
exports.createTunnel = createTunnel;
/**
 * Open an SSH session using the system's ssh command
 */
const openSshSession = async (serverNameOrId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the server by name or ID
        const server = project.servers.find((s) => s.id === serverNameOrId || s.name === serverNameOrId);
        if (!server) {
            throw new Error(`Server "${serverNameOrId}" not found in project ${projectId}`);
        }
        // Find the key for this server
        const key = server.keyId
            ? project.keys.find((k) => k.id === server.keyId)
            : null;
        // Build the SSH command
        let command = `ssh ${server.username}@${server.hostname}`;
        if (server.port !== 22) {
            command += ` -p ${server.port}`;
        }
        if (key) {
            command += ` -i "${key.path}"`;
        }
        if (options.command) {
            command += ` "${options.command}"`;
        }
        // Show the command being executed
        ui_1.log.info(`Executing: ${command}`);
        // Update server's lastUsed timestamp in the project BEFORE opening the connection
        const serverIndex = project.servers.findIndex((s) => s.id === server.id);
        if (serverIndex !== -1) {
            project.servers[serverIndex].lastUsed = new Date().toISOString();
            // Save the updated project
            await (0, config_1.saveProject)(project);
        }
        // Use a more direct approach - execute the command via a shell
        const { execSync } = require("child_process");
        try {
            // This will take over the terminal completely and block until the SSH session ends
            execSync(command, {
                stdio: "inherit",
                shell: true,
                encoding: "utf-8",
            });
        }
        catch (error) {
            // SSH returns non-zero exit codes sometimes even on successful sessions
            // We can typically ignore these errors
            if (error.status !== 0 && error.status !== 255) {
                ui_1.log.warn(`SSH process exited with code ${error.status}`);
            }
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to open SSH session: ${error.message}`);
        throw error;
    }
};
exports.openSshSession = openSshSession;
/**
 * Generate an SSH command for a server
 */
const generateSshCommand = async (serverNameOrId, options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Find the server by name or ID
        const server = project.servers.find((s) => s.id === serverNameOrId || s.name === serverNameOrId);
        if (!server) {
            throw new Error(`Server "${serverNameOrId}" not found in project ${projectId}`);
        }
        // Find the key for this server
        const key = server.keyId && options.withKey
            ? project.keys.find((k) => k.id === server.keyId)
            : null;
        // Build the SSH command
        let command = `ssh ${server.username}@${server.hostname}`;
        if (server.port !== 22) {
            command += ` -p ${server.port}`;
        }
        if (key) {
            command += ` -i "${key.path}"`;
        }
        if (options.command) {
            command += ` "${options.command}"`;
        }
        // Show the command
        if (!options.json) {
            (0, ui_1.renderBox)(command, "SSH Command", "green");
        }
        return command;
    }
    catch (error) {
        ui_1.log.error(`Failed to generate SSH command: ${error.message}`);
        throw error;
    }
};
exports.generateSshCommand = generateSshCommand;
//# sourceMappingURL=connection.js.map