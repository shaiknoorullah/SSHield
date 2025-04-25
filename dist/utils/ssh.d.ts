import { KeyType, AgentStatus } from "../types";
import { NodeSSH } from "node-ssh";
/**
 * Generate a new SSH key pair with secure parameters
 */
export declare const generateKey: (keyPath: string, options?: {
    type?: KeyType;
    bits?: number;
    kdfRounds?: number;
    passphrase?: string;
    comment?: string;
}) => Promise<{
    privateKey: string;
    publicKey: string;
}>;
/**
 * Get the fingerprint of an SSH key
 */
export declare const getKeyFingerprint: (keyPath: string) => Promise<string>;
/**
 * Start the SSH agent if not already running
 */
export declare const startAgent: () => Promise<{
    agentPid: string;
    sshAuthSock: string;
}>;
/**
 * Stop the SSH agent
 */
export declare const stopAgent: () => Promise<void>;
/**
 * Get the status of the SSH agent
 */
export declare const getAgentStatus: () => Promise<AgentStatus>;
/**
 * Add a key to the SSH agent
 */
export declare const addKeyToAgent: (keyPath: string, options?: {
    lifetime?: number;
    passphrase?: string;
}) => Promise<void>;
/**
 * Remove a key from the SSH agent
 */
export declare const removeKeyFromAgent: (keyPath: string) => Promise<void>;
/**
 * Remove all keys from the SSH agent
 */
export declare const removeAllKeysFromAgent: () => Promise<void>;
/**
 * Connect to a server using SSH
 */
export declare const connectToServer: (hostname: string, options: {
    username: string;
    port?: number;
    keyPath?: string;
    passphrase?: string;
    command?: string;
}) => Promise<NodeSSH>;
/**
 * Test SSH connection
 */
export declare const testConnection: (hostname: string, options: {
    username: string;
    port?: number;
    keyPath?: string;
    passphrase?: string;
}) => Promise<boolean>;
/**
 * Generate a key name based on purpose and timestamp
 */
export declare const generateKeyName: (purpose: string, timestamp?: Date) => string;
/**
 * Parse an SSH public key
 */
export declare const parsePublicKey: (publicKeyContent: string) => {
    type: string;
    key: string;
    comment?: string;
};
/**
 * Format an SSH key entry for .ssh/config
 */
export declare const formatSshConfigEntry: (host: string, config: {
    hostname: string;
    user: string;
    port?: number;
    identityFile?: string;
    options?: Record<string, string | number | boolean>;
}) => string;
/**
 * Update SSH config file with new entries
 */
export declare const updateSshConfig: (configEntries: string[]) => Promise<void>;
/**
 * Generate a random port number for tunneling
 */
export declare const generateRandomPort: () => number;
/**
 * Create an SSH tunnel
 */
export declare const createSshTunnel: (options: {
    localPort: number;
    remoteHost: string;
    remotePort: number;
    sshHost: string;
    sshPort?: number;
    sshUser: string;
    keyPath?: string;
}) => Promise<{
    process: any;
    localPort: number;
}>;
/**
 * Close an SSH tunnel
 */
export declare const closeSshTunnel: (process: any) => void;
