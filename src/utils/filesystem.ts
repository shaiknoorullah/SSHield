import * as fs from "fs-extra";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import {
  SSH_DIR_PERMISSIONS,
  SSH_KEY_PERMISSIONS,
  SSH_PUB_KEY_PERMISSIONS,
} from "../constants";
import { log } from "./ui";

const execAsync = promisify(exec);

/**
 * Ensure a directory exists with the correct permissions
 */
export const ensureDirectory = async (
  dirPath: string,
  permissions = SSH_DIR_PERMISSIONS
): Promise<void> => {
  try {
    await fs.ensureDir(dirPath);
    await fs.chmod(dirPath, permissions);
  } catch (error: any) {
    log.error(`Failed to create directory ${dirPath}: ${error.message}`);
    throw error;
  }
};

/**
 * Write a file with the correct permissions
 */
export const writeFile = async (
  filePath: string,
  content: string,
  permissions = SSH_KEY_PERMISSIONS
): Promise<void> => {
  try {
    await fs.writeFile(filePath, content);
    await fs.chmod(filePath, permissions);
  } catch (error: any) {
    log.error(`Failed to write file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Read a file
 */
export const readFile = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error: any) {
    log.error(`Failed to read file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Check if a file exists
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * List all files in a directory
 */
export const listFiles = async (
  dirPath: string,
  filter?: RegExp
): Promise<string[]> => {
  try {
    const files = await fs.readdir(dirPath);
    return filter ? files.filter((file) => filter.test(file)) : files;
  } catch (error: any) {
    log.error(`Failed to list files in ${dirPath}: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.remove(filePath);
  } catch (error: any) {
    log.error(`Failed to delete file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Read a JSON file
 */
export const readJsonFile = async <T>(filePath: string): Promise<T> => {
  try {
    return await fs.readJson(filePath);
  } catch (error: any) {
    log.error(`Failed to read JSON file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Write a JSON file
 */
export const writeJsonFile = async <T>(
  filePath: string,
  data: T,
  permissions = SSH_KEY_PERMISSIONS
): Promise<void> => {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    await fs.chmod(filePath, permissions);
  } catch (error: any) {
    log.error(`Failed to write JSON file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Move a file
 */
export const moveFile = async (
  source: string,
  destination: string
): Promise<void> => {
  try {
    await fs.move(source, destination, { overwrite: true });
  } catch (error: any) {
    log.error(
      `Failed to move file ${source} to ${destination}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Copy a file
 */
export const copyFile = async (
  source: string,
  destination: string
): Promise<void> => {
  try {
    await fs.copy(source, destination, { overwrite: true });
  } catch (error: any) {
    log.error(
      `Failed to copy file ${source} to ${destination}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Backup a file
 */
export const backupFile = async (
  filePath: string,
  backupDir?: string
): Promise<string> => {
  try {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = backupDir
      ? path.join(backupDir, `${fileName}.${timestamp}`)
      : `${filePath}.${timestamp}`;

    if (backupDir) {
      await ensureDirectory(backupDir);
    }

    await copyFile(filePath, backupPath);
    return backupPath;
  } catch (error: any) {
    log.error(`Failed to backup file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Run a command and return the output
 */
export const runCommand = async (command: string): Promise<string> => {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      log.warn(`Command stderr: ${stderr}`);
    }
    return stdout.trim();
  } catch (error: any) {
    log.error(`Command failed: ${command}\n${error.message}`);
    throw error;
  }
};
