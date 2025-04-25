import { ServerConfig, CommandOptions } from "../types";
/**
 * Add a server to a project
 */
export declare const addServer: (options: {
    projectId?: string;
    name: string;
    hostname: string;
    port?: number;
    username: string;
    keyId?: string;
    testConnection?: boolean;
} & CommandOptions) => Promise<ServerConfig>;
/**
 * List servers in a project
 */
export declare const listServers: (options: {
    projectId?: string;
} & CommandOptions) => Promise<ServerConfig[]>;
/**
 * Delete a server from a project
 */
export declare const deleteServer: (serverId: string, options: {
    projectId?: string;
} & CommandOptions) => Promise<void>;
/**
 * Connect to a server
 */
export declare const connectToServerCommand: (serverNameOrId: string, options: {
    projectId?: string;
    command?: string;
} & CommandOptions) => Promise<void>;
/**
 * Create an SSH tunnel
 */
export declare const createTunnel: (serverNameOrId: string, options: {
    projectId?: string;
    localPort?: number;
    remoteHost: string;
    remotePort: number;
} & CommandOptions) => Promise<void>;
/**
 * Open an SSH session using the system's ssh command
 */
export declare const openSshSession: (serverNameOrId: string, options: {
    projectId?: string;
    command?: string;
} & CommandOptions) => Promise<void>;
/**
 * Generate an SSH command for a server
 */
export declare const generateSshCommand: (serverNameOrId: string, options: {
    projectId?: string;
    command?: string;
    withKey?: boolean;
} & CommandOptions) => Promise<string>;
