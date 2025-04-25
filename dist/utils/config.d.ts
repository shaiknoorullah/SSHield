import { AppConfig, Project, SSHKey, ServerConfig } from "../types";
/**
 * Initialize the application
 */
export declare const initializeApp: (force?: boolean) => Promise<void>;
/**
 * Load application configuration
 */
export declare const loadConfig: () => Promise<AppConfig>;
/**
 * Save application configuration
 */
export declare const saveConfig: (config: AppConfig) => Promise<void>;
/**
 * Update application configuration
 */
export declare const updateConfig: (updates: Partial<AppConfig>) => Promise<AppConfig>;
/**
 * Get active project ID
 */
export declare const getActiveProject: () => Promise<string>;
/**
 * Set active project
 */
export declare const setActiveProject: (projectId: string) => Promise<void>;
/**
 * List all projects
 */
export declare const listProjects: () => Promise<Project[]>;
/**
 * Load a project
 */
export declare const loadProject: (projectId: string) => Promise<Project>;
/**
 * Save a project
 */
export declare const saveProject: (project: Project) => Promise<void>;
/**
 * Create a new project
 */
export declare const createProject: (name: string, description?: string) => Promise<Project>;
/**
 * Delete a project
 */
export declare const deleteProject: (projectId: string) => Promise<void>;
/**
 * Add a key to a project
 */
export declare const addKeyToProject: (projectId: string, key: SSHKey) => Promise<Project>;
/**
 * Remove a key from a project
 */
export declare const removeKeyFromProject: (projectId: string, keyId: string) => Promise<Project>;
/**
 * Add a server to a project
 */
export declare const addServerToProject: (projectId: string, server: ServerConfig) => Promise<Project>;
/**
 * Remove a server from a project
 */
export declare const removeServerFromProject: (projectId: string, serverId: string) => Promise<Project>;
/**
 * Update SSH config with project servers
 */
export declare const updateSshConfigWithProject: (projectId: string) => Promise<void>;
