export type KeyType = "ed25519" | "ecdsa" | "rsa";
export interface SSHKey {
    id: string;
    name: string;
    type: KeyType;
    path: string;
    publicKeyPath: string;
    fingerprint?: string;
    created: string;
    lastUsed?: string;
    comment?: string;
    bits?: number;
    kdfRounds?: number;
}
export interface ServerConfig {
    id: string;
    name: string;
    hostname: string;
    port: number;
    username: string;
    keyId: string;
    options?: Record<string, string>;
    lastUsed?: string;
}
export interface Project {
    id: string;
    name: string;
    description?: string;
    created: string;
    lastUsed?: string;
    imported?: string;
    keys: SSHKey[];
    servers: ServerConfig[];
}
export interface AppConfig {
    version: string;
    defaultProject: string;
    activeProject?: string;
    projects: string[];
    agentSettings: {
        autostart: boolean;
        timeout: number;
    };
    uiSettings: {
        colorTheme: string;
        logLevel: string;
    };
}
export interface CommandOptions {
    verbose?: boolean;
    force?: boolean;
    json?: boolean;
}
export interface AgentStatus {
    running: boolean;
    pid?: number;
    socket?: string;
    keys?: AgentKey[];
}
export interface AgentKey {
    type: string;
    fingerprint: string;
    comment?: string;
    added: string;
}
