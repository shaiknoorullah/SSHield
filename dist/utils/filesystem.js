"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.backupFile = exports.copyFile = exports.moveFile = exports.writeJsonFile = exports.readJsonFile = exports.deleteFile = exports.listFiles = exports.fileExists = exports.readFile = exports.writeFile = exports.ensureDirectory = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const constants_1 = require("../constants");
const ui_1 = require("./ui");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Ensure a directory exists with the correct permissions
 */
const ensureDirectory = async (dirPath, permissions = constants_1.SSH_DIR_PERMISSIONS) => {
    try {
        await fs.ensureDir(dirPath);
        await fs.chmod(dirPath, permissions);
    }
    catch (error) {
        ui_1.log.error(`Failed to create directory ${dirPath}: ${error.message}`);
        throw error;
    }
};
exports.ensureDirectory = ensureDirectory;
/**
 * Write a file with the correct permissions
 */
const writeFile = async (filePath, content, permissions = constants_1.SSH_KEY_PERMISSIONS) => {
    try {
        await fs.writeFile(filePath, content);
        await fs.chmod(filePath, permissions);
    }
    catch (error) {
        ui_1.log.error(`Failed to write file ${filePath}: ${error.message}`);
        throw error;
    }
};
exports.writeFile = writeFile;
/**
 * Read a file
 */
const readFile = async (filePath) => {
    try {
        return await fs.readFile(filePath, "utf8");
    }
    catch (error) {
        ui_1.log.error(`Failed to read file ${filePath}: ${error.message}`);
        throw error;
    }
};
exports.readFile = readFile;
/**
 * Check if a file exists
 */
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
};
exports.fileExists = fileExists;
/**
 * List all files in a directory
 */
const listFiles = async (dirPath, filter) => {
    try {
        const files = await fs.readdir(dirPath);
        return filter ? files.filter((file) => filter.test(file)) : files;
    }
    catch (error) {
        ui_1.log.error(`Failed to list files in ${dirPath}: ${error.message}`);
        throw error;
    }
};
exports.listFiles = listFiles;
/**
 * Delete a file
 */
const deleteFile = async (filePath) => {
    try {
        await fs.remove(filePath);
    }
    catch (error) {
        ui_1.log.error(`Failed to delete file ${filePath}: ${error.message}`);
        throw error;
    }
};
exports.deleteFile = deleteFile;
/**
 * Read a JSON file
 */
const readJsonFile = async (filePath) => {
    try {
        return await fs.readJson(filePath);
    }
    catch (error) {
        ui_1.log.error(`Failed to read JSON file ${filePath}: ${error.message}`);
        throw error;
    }
};
exports.readJsonFile = readJsonFile;
/**
 * Write a JSON file
 */
const writeJsonFile = async (filePath, data, permissions = constants_1.SSH_KEY_PERMISSIONS) => {
    try {
        await fs.writeJson(filePath, data, { spaces: 2 });
        await fs.chmod(filePath, permissions);
    }
    catch (error) {
        ui_1.log.error(`Failed to write JSON file ${filePath}: ${error.message}`);
        throw error;
    }
};
exports.writeJsonFile = writeJsonFile;
/**
 * Move a file
 */
const moveFile = async (source, destination) => {
    try {
        await fs.move(source, destination, { overwrite: true });
    }
    catch (error) {
        ui_1.log.error(`Failed to move file ${source} to ${destination}: ${error.message}`);
        throw error;
    }
};
exports.moveFile = moveFile;
/**
 * Copy a file
 */
const copyFile = async (source, destination) => {
    try {
        await fs.copy(source, destination, { overwrite: true });
    }
    catch (error) {
        ui_1.log.error(`Failed to copy file ${source} to ${destination}: ${error.message}`);
        throw error;
    }
};
exports.copyFile = copyFile;
/**
 * Backup a file
 */
const backupFile = async (filePath, backupDir) => {
    try {
        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = backupDir
            ? path.join(backupDir, `${fileName}.${timestamp}`)
            : `${filePath}.${timestamp}`;
        if (backupDir) {
            await (0, exports.ensureDirectory)(backupDir);
        }
        await (0, exports.copyFile)(filePath, backupPath);
        return backupPath;
    }
    catch (error) {
        ui_1.log.error(`Failed to backup file ${filePath}: ${error.message}`);
        throw error;
    }
};
exports.backupFile = backupFile;
/**
 * Run a command and return the output
 */
const runCommand = async (command) => {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            ui_1.log.warn(`Command stderr: ${stderr}`);
        }
        return stdout.trim();
    }
    catch (error) {
        ui_1.log.error(`Command failed: ${command}\n${error.message}`);
        throw error;
    }
};
exports.runCommand = runCommand;
//# sourceMappingURL=filesystem.js.map