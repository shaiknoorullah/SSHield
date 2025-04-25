import { AgentStatus, CommandOptions } from "../types";
/**
 * Start the SSH agent
 */
export declare const startSshAgent: (options: {
    setEnv?: boolean;
} & CommandOptions) => Promise<void>;
/**
 * Stop the SSH agent
 */
export declare const stopSshAgent: (options?: CommandOptions) => Promise<void>;
/**
 * Get the status of the SSH agent
 */
export declare const getSshAgentStatus: (options?: CommandOptions) => Promise<AgentStatus>;
/**
 * Add all project keys to the SSH agent
 */
export declare const addProjectKeysToAgent: (options: {
    projectId?: string;
    lifetime?: number;
} & CommandOptions) => Promise<void>;
/**
 * Remove all keys from the SSH agent
 */
export declare const removeAllKeysFromAgentCommand: (options?: CommandOptions) => Promise<void>;
/**
 * Generate an SSH agent startup script
 */
export declare const generateAgentStartupScript: (options: {
    outputPath?: string;
    projectId?: string;
    lifetime?: number;
} & CommandOptions) => Promise<string>;
/**
 * Export agent environment variables to a file
 */
export declare const exportAgentEnvironment: (options: {
    outputPath?: string;
} & CommandOptions) => Promise<void>;
