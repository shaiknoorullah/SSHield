import { Project, CommandOptions } from "../types";
/**
 * Create a new project
 */
export declare const createNewProject: (name: string, options: {
    description?: string;
    activate?: boolean;
} & CommandOptions) => Promise<Project>;
/**
 * List all projects
 */
export declare const listAllProjects: (options?: CommandOptions) => Promise<Project[]>;
/**
 * Set active project
 */
export declare const setActiveProjectCommand: (projectId: string, options?: CommandOptions) => Promise<void>;
/**
 * Get project details
 */
export declare const getProjectDetails: (projectId: string, options?: CommandOptions) => Promise<Project>;
/**
 * Update project details
 */
export declare const updateProject: (projectId: string, options: {
    name?: string;
    description?: string;
} & CommandOptions) => Promise<Project>;
/**
 * Delete a project
 */
export declare const deleteProjectCommand: (projectId: string, options?: CommandOptions) => Promise<void>;
/**
 * Update SSH config with project servers
 */
export declare const updateSshConfigWithProjectCommand: (options: {
    projectId?: string;
} & CommandOptions) => Promise<void>;
/**
 * Export project data
 */
export declare const exportProject: (projectId: string, options: {
    outputPath?: string;
    includeKeys?: boolean;
} & CommandOptions) => Promise<void>;
/**
 * Import project data
 */
export declare const importProject: (importPath: string, options: {
    overwrite?: boolean;
} & CommandOptions) => Promise<Project>;
