"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProject = exports.exportProject = exports.updateSshConfigWithProjectCommand = exports.deleteProjectCommand = exports.updateProject = exports.getProjectDetails = exports.setActiveProjectCommand = exports.listAllProjects = exports.createNewProject = void 0;
const config_1 = require("../utils/config");
const ui_1 = require("../utils/ui");
/**
 * Create a new project
 */
const createNewProject = async (name, options) => {
    try {
        // Show a spinner while creating the project
        const spinner = (0, ui_1.createSpinner)(`Creating project "${name}"...`);
        spinner.start();
        // Create the project
        const project = await (0, config_1.createProject)(name, options.description);
        spinner.succeed(`Project "${name}" created successfully`);
        // Set as active project if requested
        if (options.activate) {
            await (0, config_1.setActiveProject)(project.id);
            ui_1.log.success(`Project "${name}" set as active project`);
        }
        // Show project details
        (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
            "Project ID": project.id,
            Name: project.name,
            Description: project.description || "No description",
            Created: new Date(project.created).toLocaleString(),
            "SSH Keys": 0,
            Servers: 0,
        }), "Project Created", "green");
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to create project: ${error.message}`);
        throw error;
    }
};
exports.createNewProject = createNewProject;
/**
 * List all projects
 */
const listAllProjects = async (options = {}) => {
    try {
        // Get active project
        const activeProjectId = await (0, config_1.getActiveProject)();
        // Show a spinner while listing projects
        const spinner = (0, ui_1.createSpinner)("Loading projects...");
        spinner.start();
        // Get all projects
        const projects = await (0, config_1.listProjects)();
        spinner.succeed(`Loaded ${projects.length} projects`);
        // Show projects
        if (!options.json) {
            if (projects.length === 0) {
                ui_1.log.info("No projects found");
            }
            else {
                ui_1.log.info(`Projects (active: ${activeProjectId}):`);
                const projectStrings = projects.map((project) => {
                    const isActive = project.id === activeProjectId;
                    return (0, ui_1.formatKeyValueList)({
                        "Project ID": project.id + (isActive ? " (active)" : ""),
                        Name: project.name,
                        Description: project.description || "No description",
                        Created: new Date(project.created).toLocaleString(),
                        "Last Used": project.lastUsed
                            ? new Date(project.lastUsed).toLocaleString()
                            : "Never",
                        "SSH Keys": project.keys.length,
                        Servers: project.servers.length,
                    });
                });
                (0, ui_1.renderBox)(projectStrings.join("\n\n"), "Projects", "blue");
            }
        }
        return projects;
    }
    catch (error) {
        ui_1.log.error(`Failed to list projects: ${error.message}`);
        throw error;
    }
};
exports.listAllProjects = listAllProjects;
/**
 * Set active project
 */
const setActiveProjectCommand = async (projectId, options = {}) => {
    try {
        // Check if project exists
        const project = await (0, config_1.loadProject)(projectId);
        // Show a spinner while setting active project
        const spinner = (0, ui_1.createSpinner)(`Setting project "${project.name}" as active...`);
        spinner.start();
        // Set active project
        await (0, config_1.setActiveProject)(projectId);
        spinner.succeed(`Project "${project.name}" set as active project`);
        // Update last used timestamp
        project.lastUsed = new Date().toISOString();
        await (0, config_1.saveProject)(project);
    }
    catch (error) {
        ui_1.log.error(`Failed to set active project: ${error.message}`);
        throw error;
    }
};
exports.setActiveProjectCommand = setActiveProjectCommand;
/**
 * Get project details
 */
const getProjectDetails = async (projectId, options = {}) => {
    try {
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Show project details
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                "Project ID": project.id,
                Name: project.name,
                Description: project.description || "No description",
                Created: new Date(project.created).toLocaleString(),
                "Last Used": project.lastUsed
                    ? new Date(project.lastUsed).toLocaleString()
                    : "Never",
                "SSH Keys": project.keys.length,
                Servers: project.servers.length,
            }), `Project: ${project.name}`, "blue");
            // Show SSH keys if any
            if (project.keys.length > 0) {
                ui_1.log.info("\nSSH Keys:");
                project.keys.forEach((key, index) => {
                    ui_1.log.info(`  ${index + 1}. ${key.name} (${key.fingerprint})`);
                });
            }
            // Show servers if any
            if (project.servers.length > 0) {
                ui_1.log.info("\nServers:");
                project.servers.forEach((server, index) => {
                    ui_1.log.info(`  ${index + 1}. ${server.name} (${server.hostname}:${server.port})`);
                });
            }
        }
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to get project details: ${error.message}`);
        throw error;
    }
};
exports.getProjectDetails = getProjectDetails;
/**
 * Update project details
 */
const updateProject = async (projectId, options) => {
    try {
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Update project details
        if (options.name) {
            project.name = options.name;
        }
        if (options.description !== undefined) {
            project.description = options.description;
        }
        // Show a spinner while updating the project
        const spinner = (0, ui_1.createSpinner)(`Updating project "${project.name}"...`);
        spinner.start();
        // Save the project
        await (0, config_1.saveProject)(project);
        spinner.succeed(`Project "${project.name}" updated successfully`);
        // Show updated project details
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                "Project ID": project.id,
                Name: project.name,
                Description: project.description || "No description",
                Created: new Date(project.created).toLocaleString(),
                "Last Used": project.lastUsed
                    ? new Date(project.lastUsed).toLocaleString()
                    : "Never",
                "SSH Keys": project.keys.length,
                Servers: project.servers.length,
            }), "Project Updated", "green");
        }
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to update project: ${error.message}`);
        throw error;
    }
};
exports.updateProject = updateProject;
/**
 * Delete a project
 */
const deleteProjectCommand = async (projectId, options = {}) => {
    try {
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Confirm deletion if not in JSON mode
        if (!options.json) {
            const confirmed = await ui_1.prompt.confirm(`Are you sure you want to delete project "${project.name}"? This cannot be undone.`, false);
            if (!confirmed) {
                ui_1.log.info("Deletion cancelled.");
                return;
            }
        }
        // Get active project
        const activeProjectId = await (0, config_1.getActiveProject)();
        // Check if this is the active project
        if (projectId === activeProjectId) {
            ui_1.log.warn("Cannot delete the active project. Set another project as active first.");
            return;
        }
        // Show a spinner while deleting the project
        const spinner = (0, ui_1.createSpinner)(`Deleting project "${project.name}"...`);
        spinner.start();
        // Delete the project
        await (0, config_1.deleteProject)(projectId);
        spinner.succeed(`Project "${project.name}" deleted successfully`);
    }
    catch (error) {
        ui_1.log.error(`Failed to delete project: ${error.message}`);
        throw error;
    }
};
exports.deleteProjectCommand = deleteProjectCommand;
/**
 * Update SSH config with project servers
 */
const updateSshConfigWithProjectCommand = async (options) => {
    try {
        // Get active project if not specified
        const projectId = options.projectId || (await (0, config_1.getActiveProject)());
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Check if there are any servers
        if (project.servers.length === 0) {
            ui_1.log.warn(`No servers found in project ${project.name}`);
            return;
        }
        // Show a spinner while updating SSH config
        const spinner = (0, ui_1.createSpinner)(`Updating SSH config with ${project.servers.length} servers from project "${project.name}"...`);
        spinner.start();
        // Update SSH config
        await (0, config_1.updateSshConfigWithProject)(projectId);
        spinner.succeed(`SSH config updated with ${project.servers.length} servers from project "${project.name}"`);
    }
    catch (error) {
        ui_1.log.error(`Failed to update SSH config: ${error.message}`);
        throw error;
    }
};
exports.updateSshConfigWithProjectCommand = updateSshConfigWithProjectCommand;
/**
 * Export project data
 */
const exportProject = async (projectId, options) => {
    try {
        // Load the project
        const project = await (0, config_1.loadProject)(projectId);
        // Create export object
        const exportData = {
            ...project,
            exported: new Date().toISOString(),
        };
        // Remove sensitive information if not including keys
        if (!options.includeKeys) {
            exportData.keys = exportData.keys.map((key) => ({
                ...key,
                // Remove path to private key file
                path: "[REDACTED]",
            }));
        }
        // Default output path
        const outputPath = options.outputPath || `${projectId}-export.json`;
        // Show a spinner while exporting
        const spinner = (0, ui_1.createSpinner)(`Exporting project "${project.name}" to ${outputPath}...`);
        spinner.start();
        // Write export file
        await require("fs-extra").writeJson(outputPath, exportData, { spaces: 2 });
        spinner.succeed(`Project "${project.name}" exported to ${outputPath}`);
        // Show warning if including keys
        if (options.includeKeys) {
            ui_1.log.warn("The export file contains sensitive information! Keep it secure.");
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to export project: ${error.message}`);
        throw error;
    }
};
exports.exportProject = exportProject;
/**
 * Import project data
 */
const importProject = async (importPath, options) => {
    try {
        // Read import file
        const importData = await require("fs-extra").readJson(importPath);
        // Check if project already exists
        const config = await (0, config_1.loadConfig)();
        const exists = config.projects.includes(importData.id);
        if (exists && !options.overwrite) {
            throw new Error(`Project with ID ${importData.id} already exists. Use --overwrite to replace it.`);
        }
        // Show a spinner while importing
        const spinner = (0, ui_1.createSpinner)(`Importing project "${importData.name}"...`);
        spinner.start();
        // Update project data
        const project = {
            ...importData,
            imported: new Date().toISOString(),
        };
        // Save the project
        await (0, config_1.saveProject)(project);
        spinner.succeed(`Project "${project.name}" imported successfully`);
        // Show imported project details
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                "Project ID": project.id,
                Name: project.name,
                Description: project.description || "No description",
                Created: new Date(project.created).toLocaleString(),
                Imported: project.imported
                    ? new Date(project.imported).toLocaleString()
                    : "N/A",
                "SSH Keys": project.keys.length,
                Servers: project.servers.length,
            }), "Project Imported", "green");
        }
        return project;
    }
    catch (error) {
        ui_1.log.error(`Failed to import project: ${error.message}`);
        throw error;
    }
};
exports.importProject = importProject;
//# sourceMappingURL=project.js.map