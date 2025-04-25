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
exports.updateSshConfigWithProject = exports.removeServerFromProject = exports.addServerToProject = exports.removeKeyFromProject = exports.addKeyToProject = exports.deleteProject = exports.createProject = exports.saveProject = exports.loadProject = exports.listProjects = exports.setActiveProject = exports.getActiveProject = exports.updateConfig = exports.saveConfig = exports.loadConfig = exports.initializeApp = void 0;
const path = __importStar(require("path"));
const constants_1 = require("../constants");
const filesystem_1 = require("./filesystem");
const ui_1 = require("./ui");
const ssh_1 = require("./ssh");
/**
 * Default configuration
 */
const defaultConfig = {
    version: constants_1.APP_VERSION,
    defaultProject: constants_1.DEFAULT_PROJECT,
    projects: [constants_1.DEFAULT_PROJECT],
    agentSettings: {
        autostart: true,
        timeout: constants_1.DEFAULT_AGENT_TIMEOUT,
    },
    uiSettings: {
        colorTheme: "default",
        logLevel: "info",
    },
};
/**
 * Initialize the application
 */
const initializeApp = async (force = false) => {
    try {
        // Create required directories
        await Promise.all([
            (0, filesystem_1.ensureDirectory)(constants_1.BASE_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.CONFIG_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.KEYS_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.PROJECTS_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.LOGS_DIR),
        ]);
        // Check if config already exists
        const configExists = await (0, filesystem_1.fileExists)(constants_1.CONFIG_FILE);
        if (configExists && !force) {
            ui_1.log.info("Configuration already exists. Use --force to reinitialize.");
            return;
        }
        // Create default config
        await (0, filesystem_1.writeJsonFile)(constants_1.CONFIG_FILE, defaultConfig);
        // Create default project
        const defaultProjectDir = path.join(constants_1.PROJECTS_DIR, constants_1.DEFAULT_PROJECT);
        await (0, filesystem_1.ensureDirectory)(defaultProjectDir);
        // Create default project config
        const defaultProjectConfig = {
            id: constants_1.DEFAULT_PROJECT,
            name: "Default Project",
            created: new Date().toISOString(),
            keys: [],
            servers: [],
        };
        await (0, filesystem_1.writeJsonFile)(path.join(defaultProjectDir, "project.json"), defaultProjectConfig);
        // Set active project
        await (0, exports.setActiveProject)(constants_1.DEFAULT_PROJECT);
        ui_1.log.success(`${constants_1.APP_NAME} initialized successfully.`);
    }
    catch (error) {
        ui_1.log.error(`Failed to initialize app: ${error.message}`);
        throw error;
    }
};
exports.initializeApp = initializeApp;
/**
 * Load application configuration
 */
const loadConfig = async () => {
    try {
        // Check if config file exists
        if (!(await (0, filesystem_1.fileExists)(constants_1.CONFIG_FILE))) {
            // Initialize with default config
            await (0, exports.initializeApp)();
        }
        // Read config file
        return await (0, filesystem_1.readJsonFile)(constants_1.CONFIG_FILE);
    }
    catch (error) {
        ui_1.log.error(`Failed to load config: ${error.message}`);
        throw error;
    }
};
exports.loadConfig = loadConfig;
/**
 * Save application configuration
 */
const saveConfig = async (config) => {
    try {
        await (0, filesystem_1.writeJsonFile)(constants_1.CONFIG_FILE, config);
    }
    catch (error) {
        ui_1.log.error(`Failed to save config: ${error.message}`);
        throw error;
    }
};
exports.saveConfig = saveConfig;
/**
 * Update application configuration
 */
const updateConfig = async (updates) => {
    try {
        const config = await (0, exports.loadConfig)();
        const updatedConfig = { ...config, ...updates };
        await (0, exports.saveConfig)(updatedConfig);
        return updatedConfig;
    }
    catch (error) {
        ui_1.log.error(`Failed to update config: ${error.message}`);
        throw error;
    }
};
exports.updateConfig = updateConfig;
/**
 * Get active project ID
 */
const getActiveProject = async () => {
    try {
        if (await (0, filesystem_1.fileExists)(constants_1.ACTIVE_PROJECT_FILE)) {
            return (await (0, filesystem_1.readFile)(constants_1.ACTIVE_PROJECT_FILE)).trim();
        }
        else {
            // Use default project if no active project is set
            const config = await (0, exports.loadConfig)();
            return config.defaultProject;
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to get active project: ${error.message}`);
        throw error;
    }
};
exports.getActiveProject = getActiveProject;
/**
 * Set active project
 */
const setActiveProject = async (projectId) => {
    try {
        await (0, filesystem_1.writeFile)(constants_1.ACTIVE_PROJECT_FILE, projectId);
        // Update config as well
        const config = await (0, exports.loadConfig)();
        config.activeProject = projectId;
        await (0, exports.saveConfig)(config);
    }
    catch (error) {
        ui_1.log.error(`Failed to set active project: ${error.message}`);
        throw error;
    }
};
exports.setActiveProject = setActiveProject;
/**
 * List all projects
 */
const listProjects = async () => {
    try {
        const config = await (0, exports.loadConfig)();
        const projects = [];
        for (const projectId of config.projects) {
            const projectPath = path.join(constants_1.PROJECTS_DIR, projectId, "project.json");
            if (await (0, filesystem_1.fileExists)(projectPath)) {
                const project = await (0, filesystem_1.readJsonFile)(projectPath);
                projects.push(project);
            }
        }
        return projects;
    }
    catch (error) {
        ui_1.log.error(`Failed to list projects: ${error.message}`);
        throw error;
    }
};
exports.listProjects = listProjects;
/**
 * Load a project
 */
const loadProject = async (projectId) => {
    try {
        const projectPath = path.join(constants_1.PROJECTS_DIR, projectId, "project.json");
        if (!(await (0, filesystem_1.fileExists)(projectPath))) {
            throw new Error(`Project ${projectId} does not exist`);
        }
        return await (0, filesystem_1.readJsonFile)(projectPath);
    }
    catch (error) {
        ui_1.log.error(`Failed to load project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.loadProject = loadProject;
/**
 * Save a project
 */
const saveProject = async (project) => {
    try {
        // Create project directory if it doesn't exist
        const projectDir = path.join(constants_1.PROJECTS_DIR, project.id);
        await (0, filesystem_1.ensureDirectory)(projectDir);
        // Save project config
        await (0, filesystem_1.writeJsonFile)(path.join(projectDir, "project.json"), project);
        // Update app config to include this project if not already present
        const config = await (0, exports.loadConfig)();
        if (!config.projects.includes(project.id)) {
            config.projects.push(project.id);
            await (0, exports.saveConfig)(config);
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to save project ${project.id}: ${error.message}`);
        throw error;
    }
};
exports.saveProject = saveProject;
/**
 * Create a new project
 */
const createProject = async (name, description) => {
    try {
        // Generate a safe project ID from the name
        const projectId = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        // Check if project already exists
        const config = await (0, exports.loadConfig)();
        if (config.projects.includes(projectId)) {
            throw new Error(`Project with ID ${projectId} already exists`);
        }
        // Create the project
        const project = {
            id: projectId,
            name,
            description,
            created: new Date().toISOString(),
            keys: [],
            servers: [],
        };
        // Save the project
        await (0, exports.saveProject)(project);
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to create project: ${error.message}`);
        throw error;
    }
};
exports.createProject = createProject;
/**
 * Delete a project
 */
const deleteProject = async (projectId) => {
    try {
        // Check if it's the default project
        const config = await (0, exports.loadConfig)();
        if (projectId === config.defaultProject) {
            throw new Error("Cannot delete the default project");
        }
        // Update the app config to remove this project
        config.projects = config.projects.filter((id) => id !== projectId);
        await (0, exports.saveConfig)(config);
        // Remove project directory
        // Note: We don't remove the actual files/keys for safety
        // but we remove the project from the configuration
        ui_1.log.warn(`Project ${projectId} has been removed from configuration.`);
        ui_1.log.warn(`The project files remain in ${path.join(constants_1.PROJECTS_DIR, projectId)}.`);
    }
    catch (error) {
        ui_1.log.error(`Failed to delete project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.deleteProject = deleteProject;
/**
 * Add a key to a project
 */
const addKeyToProject = async (projectId, key) => {
    try {
        const project = await (0, exports.loadProject)(projectId);
        // Check if key with same ID already exists
        if (project.keys.some((k) => k.id === key.id)) {
            throw new Error(`Key with ID ${key.id} already exists in project ${projectId}`);
        }
        // Add the key to the project
        project.keys.push(key);
        // Save the project
        await (0, exports.saveProject)(project);
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to add key to project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.addKeyToProject = addKeyToProject;
/**
 * Remove a key from a project
 */
const removeKeyFromProject = async (projectId, keyId) => {
    try {
        const project = await (0, exports.loadProject)(projectId);
        // Remove the key from the project
        project.keys = project.keys.filter((k) => k.id !== keyId);
        // Update any servers that were using this key
        for (const server of project.servers) {
            if (server.keyId === keyId) {
                server.keyId = "";
            }
        }
        // Save the project
        await (0, exports.saveProject)(project);
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to remove key from project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.removeKeyFromProject = removeKeyFromProject;
/**
 * Add a server to a project
 */
const addServerToProject = async (projectId, server) => {
    try {
        const project = await (0, exports.loadProject)(projectId);
        // Check if server with same ID already exists
        if (project.servers.some((s) => s.id === server.id)) {
            throw new Error(`Server with ID ${server.id} already exists in project ${projectId}`);
        }
        // Add the server to the project
        project.servers.push(server);
        // Save the project
        await (0, exports.saveProject)(project);
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to add server to project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.addServerToProject = addServerToProject;
/**
 * Remove a server from a project
 */
const removeServerFromProject = async (projectId, serverId) => {
    try {
        const project = await (0, exports.loadProject)(projectId);
        // Remove the server from the project
        project.servers = project.servers.filter((s) => s.id !== serverId);
        // Save the project
        await (0, exports.saveProject)(project);
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to remove server from project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.removeServerFromProject = removeServerFromProject;
/**
 * Update SSH config with project servers
 */
const updateSshConfigWithProject = async (projectId) => {
    try {
        const project = await (0, exports.loadProject)(projectId);
        // Backup current SSH config
        await (0, filesystem_1.backupFile)(constants_1.SSH_CONFIG_PATH);
        // Generate SSH config entries for each server
        const configEntries = [];
        for (const server of project.servers) {
            // Find the key for this server
            const key = project.keys.find((k) => k.id === server.keyId);
            configEntries.push((0, ssh_1.formatSshConfigEntry)(server.name, {
                hostname: server.hostname,
                user: server.username,
                port: server.port,
                identityFile: key ? key.path : undefined,
                options: {
                    ServerAliveInterval: 60,
                    ServerAliveCountMax: 120,
                    ...server.options,
                },
            }));
        }
        // Add a project header
        const header = `# Project: ${project.name} (${project.id})\n`;
        // Read current config
        let currentConfig = "";
        if (await (0, filesystem_1.fileExists)(constants_1.SSH_CONFIG_PATH)) {
            currentConfig = await (0, filesystem_1.readFile)(constants_1.SSH_CONFIG_PATH);
        }
        // Find any existing project sections and replace them
        const projectRegex = new RegExp(`# Project: .* \\(${projectId}\\)[\\s\\S]*?(?=# Project:|$)`, "g");
        if (projectRegex.test(currentConfig)) {
            currentConfig = currentConfig.replace(projectRegex, header + configEntries.join("\n\n") + "\n\n");
        }
        else {
            currentConfig += "\n\n" + header + configEntries.join("\n\n") + "\n\n";
        }
        // Write updated config
        await (0, filesystem_1.writeFile)(constants_1.SSH_CONFIG_PATH, currentConfig);
        ui_1.log.success(`SSH config updated with ${project.servers.length} servers from project ${projectId}.`);
    }
    catch (error) {
        ui_1.log.error(`Failed to update SSH config with project ${projectId}: ${error.message}`);
        throw error;
    }
};
exports.updateSshConfigWithProject = updateSshConfigWithProject;
//# sourceMappingURL=config.js.map