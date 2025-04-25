import { SSHKey, KeyType, CommandOptions } from "../types";
/**
 * Generate a new SSH key
 */
export declare const generateSshKey: (options: {
    projectId?: string;
    name?: string;
    type?: KeyType;
    bits?: number;
    kdfRounds?: number;
    comment?: string;
    passphrase?: string;
    force?: boolean;
} & CommandOptions) => Promise<SSHKey>;
/**
 * List all SSH keys for a project
 */
export declare const listSshKeys: (options: {
    projectId?: string;
} & CommandOptions) => Promise<SSHKey[]>;
/**
 * Delete an SSH key
 */
export declare const deleteSshKey: (keyId: string, options: {
    projectId?: string;
    removeFiles?: boolean;
} & CommandOptions) => Promise<void>;
/**
 * Get an SSH key by ID
 */
export declare const getSshKey: (keyId: string, options: {
    projectId?: string;
} & CommandOptions) => Promise<SSHKey>;
/**
 * Add an SSH key to the agent
 */
export declare const addKeyToAgentCommand: (keyId: string, options: {
    projectId?: string;
    lifetime?: number;
    passphrase?: string;
} & CommandOptions) => Promise<void>;
/**
 * Show the public key
 */
export declare const showPublicKey: (keyId: string, options: {
    projectId?: string;
    clipboard?: boolean;
} & CommandOptions) => Promise<string>;
/**
 * Import an existing SSH key
 */
export declare const importSshKey: (keyPath: string, options: {
    projectId?: string;
    name?: string;
    copy?: boolean;
} & CommandOptions) => Promise<SSHKey>;
