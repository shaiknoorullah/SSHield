/**
 * Ensure a directory exists with the correct permissions
 */
export declare const ensureDirectory: (dirPath: string, permissions?: number) => Promise<void>;
/**
 * Write a file with the correct permissions
 */
export declare const writeFile: (filePath: string, content: string, permissions?: number) => Promise<void>;
/**
 * Read a file
 */
export declare const readFile: (filePath: string) => Promise<string>;
/**
 * Check if a file exists
 */
export declare const fileExists: (filePath: string) => Promise<boolean>;
/**
 * List all files in a directory
 */
export declare const listFiles: (dirPath: string, filter?: RegExp) => Promise<string[]>;
/**
 * Delete a file
 */
export declare const deleteFile: (filePath: string) => Promise<void>;
/**
 * Read a JSON file
 */
export declare const readJsonFile: <T>(filePath: string) => Promise<T>;
/**
 * Write a JSON file
 */
export declare const writeJsonFile: <T>(filePath: string, data: T, permissions?: number) => Promise<void>;
/**
 * Move a file
 */
export declare const moveFile: (source: string, destination: string) => Promise<void>;
/**
 * Copy a file
 */
export declare const copyFile: (source: string, destination: string) => Promise<void>;
/**
 * Backup a file
 */
export declare const backupFile: (filePath: string, backupDir?: string) => Promise<string>;
/**
 * Run a command and return the output
 */
export declare const runCommand: (command: string) => Promise<string>;
