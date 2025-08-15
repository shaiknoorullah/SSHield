import { Project, CommandOptions } from "../types";
import {
  loadConfig,
  createProject,
  loadProject,
  listProjects,
  saveProject,
  deleteProject,
  setActiveProject,
  getActiveProject,
  updateSshConfigWithProject,
} from "../utils/config";
import {
  log,
  prompt,
  createSpinner,
  renderBox,
  formatKeyValueList,
} from "../utils/ui";

/**
 * Create a new project
 */
export const createNewProject = async (
  name: string,
  options: {
    description?: string;
    activate?: boolean;
  } & CommandOptions
): Promise<Project> => {
  try {
    // Show a spinner while creating the project
    const spinner = createSpinner(`Creating project "${name}"...`);
    spinner.start();

    // Create the project
    const project = await createProject(name, options.description);

    spinner.succeed(`Project "${name}" created successfully`);

    // Set as active project if requested
    if (options.activate) {
      await setActiveProject(project.id);
      log.success(`Project "${name}" set as active project`);
    }

    // Show project details
    renderBox(
      formatKeyValueList({
        "Project ID": project.id,
        Name: project.name,
        Description: project.description || "No description",
        Created: new Date(project.created).toLocaleString(),
        "SSH Keys": 0,
        Servers: 0,
      }),
      "Project Created",
      "green"
    );

    return project;
  } catch (error: any) {
    log.error(`Failed to create project: ${error.message}`);
    throw error;
  }
};

/**
 * List all projects
 */
export const listAllProjects = async (
  options: CommandOptions = {}
): Promise<Project[]> => {
  try {
    // Get active project
    const activeProjectId = await getActiveProject();

    // Show a spinner while listing projects
    const spinner = createSpinner("Loading projects...");
    spinner.start();

    // Get all projects
    const projects = await listProjects();

    spinner.succeed(`Loaded ${projects.length} projects`);

    // Show projects
    if (!options.json) {
      if (projects.length === 0) {
        log.info("No projects found");
      } else {
        log.info(`Projects (active: ${activeProjectId}):`);

        const projectStrings = projects.map((project) => {
          const isActive = project.id === activeProjectId;

          return formatKeyValueList({
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

        renderBox(projectStrings.join("\n\n"), "Projects", "blue");
      }
    }

    return projects;
  } catch (error: any) {
    log.error(`Failed to list projects: ${error.message}`);
    throw error;
  }
};

/**
 * Set active project
 */
export const setActiveProjectCommand = async (
  projectId: string,
  options: CommandOptions = {}
): Promise<void> => {
  try {
    // Check if project exists
    const project = await loadProject(projectId);

    // Show a spinner while setting active project
    const spinner = createSpinner(
      `Setting project "${project.name}" as active...`
    );
    spinner.start();

    // Set active project
    await setActiveProject(projectId);

    spinner.succeed(`Project "${project.name}" set as active project`);

    // Update last used timestamp
    project.lastUsed = new Date().toISOString();
    await saveProject(project);
  } catch (error: any) {
    log.error(`Failed to set active project: ${error.message}`);
    throw error;
  }
};

/**
 * Get project details
 */
export const getProjectDetails = async (
  projectId: string,
  options: CommandOptions = {}
): Promise<Project> => {
  try {
    // Load the project
    const project = await loadProject(projectId);

    // Show project details
    if (!options.json) {
      renderBox(
        formatKeyValueList({
          "Project ID": project.id,
          Name: project.name,
          Description: project.description || "No description",
          Created: new Date(project.created).toLocaleString(),
          "Last Used": project.lastUsed
            ? new Date(project.lastUsed).toLocaleString()
            : "Never",
          "SSH Keys": project.keys.length,
          Servers: project.servers.length,
        }),
        `Project: ${project.name}`,
        "blue"
      );

      // Show SSH keys if any
      if (project.keys.length > 0) {
        log.info("\nSSH Keys:");
        project.keys.forEach((key, index) => {
          log.info(`  ${index + 1}. ${key.name} (${key.fingerprint})`);
        });
      }

      // Show servers if any
      if (project.servers.length > 0) {
        log.info("\nServers:");
        project.servers.forEach((server, index) => {
          log.info(
            `  ${index + 1}. ${server.name} (${server.hostname}:${server.port})`
          );
        });
      }
    }

    return project;
  } catch (error: any) {
    log.error(`Failed to get project details: ${error.message}`);
    throw error;
  }
};

/**
 * Update project details
 */
export const updateProject = async (
  projectId: string,
  options: {
    name?: string;
    description?: string;
  } & CommandOptions
): Promise<Project> => {
  try {
    // Load the project
    const project = await loadProject(projectId);

    // Update project details
    if (options.name) {
      project.name = options.name;
    }

    if (options.description !== undefined) {
      project.description = options.description;
    }

    // Show a spinner while updating the project
    const spinner = createSpinner(`Updating project "${project.name}"...`);
    spinner.start();

    // Save the project
    await saveProject(project);

    spinner.succeed(`Project "${project.name}" updated successfully`);

    // Show updated project details
    if (!options.json) {
      renderBox(
        formatKeyValueList({
          "Project ID": project.id,
          Name: project.name,
          Description: project.description || "No description",
          Created: new Date(project.created).toLocaleString(),
          "Last Used": project.lastUsed
            ? new Date(project.lastUsed).toLocaleString()
            : "Never",
          "SSH Keys": project.keys.length,
          Servers: project.servers.length,
        }),
        "Project Updated",
        "green"
      );
    }

    return project;
  } catch (error: any) {
    log.error(`Failed to update project: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProjectCommand = async (
  projectId: string,
  options: CommandOptions = {}
): Promise<void> => {
  try {
    // Load the project
    const project = await loadProject(projectId);

    // Confirm deletion if not in JSON mode
    if (!options.json) {
      const confirmed = await prompt.confirm(
        `Are you sure you want to delete project "${project.name}"? This cannot be undone.`,
        false
      );

      if (!confirmed) {
        log.info("Deletion cancelled.");
        return;
      }
    }

    // Get active project
    const activeProjectId = await getActiveProject();

    // Check if this is the active project
    if (projectId === activeProjectId) {
      log.warn(
        "Cannot delete the active project. Set another project as active first."
      );
      return;
    }

    // Show a spinner while deleting the project
    const spinner = createSpinner(`Deleting project "${project.name}"...`);
    spinner.start();

    // Delete the project
    await deleteProject(projectId);

    spinner.succeed(`Project "${project.name}" deleted successfully`);
  } catch (error: any) {
    log.error(`Failed to delete project: ${error.message}`);
    throw error;
  }
};

/**
 * Update SSH config with project servers
 */
export const updateSshConfigWithProjectCommand = async (
  options: {
    projectId?: string;
  } & CommandOptions
): Promise<void> => {
  try {
    // Get active project if not specified
    const projectId = options.projectId || (await getActiveProject());

    // Load the project
    const project = await loadProject(projectId);

    // Check if there are any servers
    if (project.servers.length === 0) {
      log.warn(`No servers found in project ${project.name}`);
      return;
    }

    // Show a spinner while updating SSH config
    const spinner = createSpinner(
      `Updating SSH config with ${project.servers.length} servers from project "${project.name}"...`
    );
    spinner.start();

    // Update SSH config
    await updateSshConfigWithProject(projectId);

    spinner.succeed(
      `SSH config updated with ${project.servers.length} servers from project "${project.name}"`
    );
  } catch (error: any) {
    log.error(`Failed to update SSH config: ${error.message}`);
    throw error;
  }
};

/**
 * Export project data
 */
export const exportProject = async (
  projectId: string,
  options: {
    outputPath?: string;
    includeKeys?: boolean;
  } & CommandOptions
): Promise<void> => {
  try {
    // Load the project
    const project = await loadProject(projectId);

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
    const spinner = createSpinner(
      `Exporting project "${project.name}" to ${outputPath}...`
    );
    spinner.start();

    // Write export file
    await require("fs-extra").writeJson(outputPath, exportData, { spaces: 2 });

    spinner.succeed(`Project "${project.name}" exported to ${outputPath}`);

    // Show warning if including keys
    if (options.includeKeys) {
      log.warn(
        "The export file contains sensitive information! Keep it secure."
      );
    }
  } catch (error: any) {
    log.error(`Failed to export project: ${error.message}`);
    throw error;
  }
};

/**
 * Import project data
 */
export const importProject = async (
  importPath: string,
  options: {
    overwrite?: boolean;
  } & CommandOptions
): Promise<Project> => {
  try {
    // Read import file
    const importData = await require("fs-extra").readJson(importPath);

    // Check if project already exists
    const config = await loadConfig();
    const exists = config.projects.includes(importData.id);

    if (exists && !options.overwrite) {
      throw new Error(
        `Project with ID ${importData.id} already exists. Use --overwrite to replace it.`
      );
    }

    // Show a spinner while importing
    const spinner = createSpinner(`Importing project "${importData.name}"...`);
    spinner.start();

    // Update project data
    const project: Project = {
      ...importData,
      imported: new Date().toISOString(),
    };

    // Save the project
    await saveProject(project);

    spinner.succeed(`Project "${project.name}" imported successfully`);

    // Show imported project details
    if (!options.json) {
      renderBox(
        formatKeyValueList({
          "Project ID": project.id,
          Name: project.name,
          Description: project.description || "No description",
          Created: new Date(project.created).toLocaleString(),
          Imported: project.imported
            ? new Date(project.imported).toLocaleString()
            : "N/A",
          "SSH Keys": project.keys.length,
          Servers: project.servers.length,
        }),
        "Project Imported",
        "green"
      );
    }

    return project;
  } catch (error: any) {
    log.error(`Failed to import project: ${error.message}`);
    throw error;
  }
};
