import * as path from "path";
import { AppConfig, Project, SSHKey, ServerConfig } from "../types";
import {
  APP_NAME,
  APP_VERSION,
  BASE_DIR,
  CONFIG_DIR,
  CONFIG_FILE,
  PROJECTS_DIR,
  KEYS_DIR,
  LOGS_DIR,
  DEFAULT_PROJECT,
  DEFAULT_AGENT_TIMEOUT,
  SSH_CONFIG_PATH,
  ACTIVE_PROJECT_FILE,
} from "../constants";
import {
  ensureDirectory,
  writeJsonFile,
  readJsonFile,
  fileExists,
  writeFile,
  readFile,
  backupFile,
} from "./filesystem";
import { log } from "./ui";
import { formatSshConfigEntry } from "./ssh";

/**
 * Default configuration
 */
const defaultConfig: AppConfig = {
  version: APP_VERSION,
  defaultProject: DEFAULT_PROJECT,
  projects: [DEFAULT_PROJECT],
  agentSettings: {
    autostart: true,
    timeout: DEFAULT_AGENT_TIMEOUT,
  },
  uiSettings: {
    colorTheme: "default",
    logLevel: "info",
  },
};

/**
 * Initialize the application
 */
export const initializeApp = async (force = false): Promise<void> => {
  try {
    // Create required directories
    await Promise.all([
      ensureDirectory(BASE_DIR),
      ensureDirectory(CONFIG_DIR),
      ensureDirectory(KEYS_DIR),
      ensureDirectory(PROJECTS_DIR),
      ensureDirectory(LOGS_DIR),
    ]);

    // Check if config already exists
    const configExists = await fileExists(CONFIG_FILE);
    if (configExists && !force) {
      log.info("Configuration already exists. Use --force to reinitialize.");
      return;
    }

    // Create default config
    await writeJsonFile<AppConfig>(CONFIG_FILE, defaultConfig);

    // Create default project
    const defaultProjectDir = path.join(PROJECTS_DIR, DEFAULT_PROJECT);
    await ensureDirectory(defaultProjectDir);

    // Create default project config
    const defaultProjectConfig: Project = {
      id: DEFAULT_PROJECT,
      name: "Default Project",
      created: new Date().toISOString(),
      keys: [],
      servers: [],
    };

    await writeJsonFile<Project>(
      path.join(defaultProjectDir, "project.json"),
      defaultProjectConfig
    );

    // Set active project
    await setActiveProject(DEFAULT_PROJECT);

    log.success(`${APP_NAME} initialized successfully.`);
  } catch (error: any) {
    log.error(`Failed to initialize app: ${error.message}`);
    throw error;
  }
};

/**
 * Load application configuration
 */
export const loadConfig = async (): Promise<AppConfig> => {
  try {
    // Check if config file exists
    if (!(await fileExists(CONFIG_FILE))) {
      // Initialize with default config
      await initializeApp();
    }

    // Read config file
    return await readJsonFile<AppConfig>(CONFIG_FILE);
  } catch (error: any) {
    log.error(`Failed to load config: ${error.message}`);
    throw error;
  }
};

/**
 * Save application configuration
 */
export const saveConfig = async (config: AppConfig): Promise<void> => {
  try {
    await writeJsonFile<AppConfig>(CONFIG_FILE, config);
  } catch (error: any) {
    log.error(`Failed to save config: ${error.message}`);
    throw error;
  }
};

/**
 * Update application configuration
 */
export const updateConfig = async (
  updates: Partial<AppConfig>
): Promise<AppConfig> => {
  try {
    const config = await loadConfig();
    const updatedConfig = { ...config, ...updates };
    await saveConfig(updatedConfig);
    return updatedConfig;
  } catch (error: any) {
    log.error(`Failed to update config: ${error.message}`);
    throw error;
  }
};

/**
 * Get active project ID
 */
export const getActiveProject = async (): Promise<string> => {
  try {
    if (await fileExists(ACTIVE_PROJECT_FILE)) {
      return (await readFile(ACTIVE_PROJECT_FILE)).trim();
    } else {
      // Use default project if no active project is set
      const config = await loadConfig();
      return config.defaultProject;
    }
  } catch (error: any) {
    log.error(`Failed to get active project: ${error.message}`);
    throw error;
  }
};

/**
 * Set active project
 */
export const setActiveProject = async (projectId: string): Promise<void> => {
  try {
    await writeFile(ACTIVE_PROJECT_FILE, projectId);

    // Update config as well
    const config = await loadConfig();
    config.activeProject = projectId;
    await saveConfig(config);
  } catch (error: any) {
    log.error(`Failed to set active project: ${error.message}`);
    throw error;
  }
};

/**
 * List all projects
 */
export const listProjects = async (): Promise<Project[]> => {
  try {
    const config = await loadConfig();
    const projects: Project[] = [];

    for (const projectId of config.projects) {
      const projectPath = path.join(PROJECTS_DIR, projectId, "project.json");
      if (await fileExists(projectPath)) {
        const project = await readJsonFile<Project>(projectPath);
        projects.push(project);
      }
    }

    return projects;
  } catch (error: any) {
    log.error(`Failed to list projects: ${error.message}`);
    throw error;
  }
};

/**
 * Load a project
 */
export const loadProject = async (projectId: string): Promise<Project> => {
  try {
    const projectPath = path.join(PROJECTS_DIR, projectId, "project.json");

    if (!(await fileExists(projectPath))) {
      throw new Error(`Project ${projectId} does not exist`);
    }

    return await readJsonFile<Project>(projectPath);
  } catch (error: any) {
    log.error(`Failed to load project ${projectId}: ${error.message}`);
    throw error;
  }
};

/**
 * Save a project
 */
export const saveProject = async (project: Project): Promise<void> => {
  try {
    // Create project directory if it doesn't exist
    const projectDir = path.join(PROJECTS_DIR, project.id);
    await ensureDirectory(projectDir);

    // Save project config
    await writeJsonFile<Project>(
      path.join(projectDir, "project.json"),
      project
    );

    // Update app config to include this project if not already present
    const config = await loadConfig();
    if (!config.projects.includes(project.id)) {
      config.projects.push(project.id);
      await saveConfig(config);
    }
  } catch (error: any) {
    log.error(`Failed to save project ${project.id}: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new project
 */
export const createProject = async (
  name: string,
  description?: string
): Promise<Project> => {
  try {
    // Generate a safe project ID from the name
    const projectId = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if project already exists
    const config = await loadConfig();
    if (config.projects.includes(projectId)) {
      throw new Error(`Project with ID ${projectId} already exists`);
    }

    // Create the project
    const project: Project = {
      id: projectId,
      name,
      description,
      created: new Date().toISOString(),
      keys: [],
      servers: [],
    };

    // Save the project
    await saveProject(project);

    return project;
  } catch (error: any) {
    log.error(`Failed to create project: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    // Check if it's the default project
    const config = await loadConfig();
    if (projectId === config.defaultProject) {
      throw new Error("Cannot delete the default project");
    }

    // Update the app config to remove this project
    config.projects = config.projects.filter((id) => id !== projectId);
    await saveConfig(config);

    // Remove project directory
    // Note: We don't remove the actual files/keys for safety
    // but we remove the project from the configuration
    log.warn(`Project ${projectId} has been removed from configuration.`);
    log.warn(
      `The project files remain in ${path.join(PROJECTS_DIR, projectId)}.`
    );
  } catch (error: any) {
    log.error(`Failed to delete project ${projectId}: ${error.message}`);
    throw error;
  }
};

/**
 * Add a key to a project
 */
export const addKeyToProject = async (
  projectId: string,
  key: SSHKey
): Promise<Project> => {
  try {
    const project = await loadProject(projectId);

    // Check if key with same ID already exists
    if (project.keys.some((k) => k.id === key.id)) {
      throw new Error(
        `Key with ID ${key.id} already exists in project ${projectId}`
      );
    }

    // Add the key to the project
    project.keys.push(key);

    // Save the project
    await saveProject(project);

    return project;
  } catch (error: any) {
    log.error(`Failed to add key to project ${projectId}: ${error.message}`);
    throw error;
  }
};

/**
 * Remove a key from a project
 */
export const removeKeyFromProject = async (
  projectId: string,
  keyId: string
): Promise<Project> => {
  try {
    const project = await loadProject(projectId);

    // Remove the key from the project
    project.keys = project.keys.filter((k) => k.id !== keyId);

    // Update any servers that were using this key
    for (const server of project.servers) {
      if (server.keyId === keyId) {
        server.keyId = "";
      }
    }

    // Save the project
    await saveProject(project);

    return project;
  } catch (error: any) {
    log.error(
      `Failed to remove key from project ${projectId}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Add a server to a project
 */
export const addServerToProject = async (
  projectId: string,
  server: ServerConfig
): Promise<Project> => {
  try {
    const project = await loadProject(projectId);

    // Check if server with same ID already exists
    if (project.servers.some((s) => s.id === server.id)) {
      throw new Error(
        `Server with ID ${server.id} already exists in project ${projectId}`
      );
    }

    // Add the server to the project
    project.servers.push(server);

    // Save the project
    await saveProject(project);

    return project;
  } catch (error: any) {
    log.error(`Failed to add server to project ${projectId}: ${error.message}`);
    throw error;
  }
};

/**
 * Remove a server from a project
 */
export const removeServerFromProject = async (
  projectId: string,
  serverId: string
): Promise<Project> => {
  try {
    const project = await loadProject(projectId);

    // Remove the server from the project
    project.servers = project.servers.filter((s) => s.id !== serverId);

    // Save the project
    await saveProject(project);

    return project;
  } catch (error: any) {
    log.error(
      `Failed to remove server from project ${projectId}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Update SSH config with project servers
 */
export const updateSshConfigWithProject = async (
  projectId: string
): Promise<void> => {
  try {
    const project = await loadProject(projectId);

    // Backup current SSH config
    await backupFile(SSH_CONFIG_PATH);

    // Generate SSH config entries for each server
    const configEntries: string[] = [];

    for (const server of project.servers) {
      // Find the key for this server
      const key = project.keys.find((k) => k.id === server.keyId);

      configEntries.push(
        formatSshConfigEntry(server.name, {
          hostname: server.hostname,
          user: server.username,
          port: server.port,
          identityFile: key ? key.path : undefined,
          options: {
            ServerAliveInterval: 60,
            ServerAliveCountMax: 120,
            ...server.options,
          },
        })
      );
    }

    // Add a project header
    const header = `# Project: ${project.name} (${project.id})\n`;

    // Read current config
    let currentConfig = "";
    if (await fileExists(SSH_CONFIG_PATH)) {
      currentConfig = await readFile(SSH_CONFIG_PATH);
    }

    // Find any existing project sections and replace them
    const projectRegex = new RegExp(
      `# Project: .* \\(${projectId}\\)[\\s\\S]*?(?=# Project:|$)`,
      "g"
    );

    if (projectRegex.test(currentConfig)) {
      currentConfig = currentConfig.replace(
        projectRegex,
        header + configEntries.join("\n\n") + "\n\n"
      );
    } else {
      currentConfig += "\n\n" + header + configEntries.join("\n\n") + "\n\n";
    }

    // Write updated config
    await writeFile(SSH_CONFIG_PATH, currentConfig);

    log.success(
      `SSH config updated with ${project.servers.length} servers from project ${projectId}.`
    );
  } catch (error: any) {
    log.error(
      `Failed to update SSH config with project ${projectId}: ${error.message}`
    );
    throw error;
  }
};
