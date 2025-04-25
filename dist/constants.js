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
exports.LOG_LEVELS = exports.SPINNER_INTERVAL = exports.DEFAULT_AGENT_TIMEOUT = exports.SSH_DIR_PERMISSIONS = exports.SSH_PUB_KEY_PERMISSIONS = exports.SSH_KEY_PERMISSIONS = exports.SERVER_ALIVE_COUNT_MAX = exports.SERVER_ALIVE_INTERVAL = exports.DEFAULT_PROJECT = exports.DEFAULT_KDF_ROUNDS = exports.DEFAULT_KEY_BITS = exports.DEFAULT_KEY_TYPE = exports.SSH_CONFIG_BACKUP_PATH = exports.SSH_CONFIG_PATH = exports.ACTIVE_PROJECT_FILE = exports.CONFIG_FILE = exports.PROJECTS_DIR = exports.LOGS_DIR = exports.CONFIG_DIR = exports.KEYS_DIR = exports.BASE_DIR = exports.HOME_DIR = exports.APP_VERSION = exports.APP_NAME = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
// App name and version
exports.APP_NAME = "ssh-manager";
exports.APP_VERSION = "1.0.0";
// Base directories
exports.HOME_DIR = os.homedir();
exports.BASE_DIR = path.join(exports.HOME_DIR, ".ssh-manager");
exports.KEYS_DIR = path.join(exports.BASE_DIR, "keys");
exports.CONFIG_DIR = path.join(exports.BASE_DIR, "config");
exports.LOGS_DIR = path.join(exports.BASE_DIR, "logs");
exports.PROJECTS_DIR = path.join(exports.BASE_DIR, "projects");
// Config files
exports.CONFIG_FILE = path.join(exports.CONFIG_DIR, "config.json");
exports.ACTIVE_PROJECT_FILE = path.join(exports.CONFIG_DIR, "active-project");
exports.SSH_CONFIG_PATH = path.join(exports.HOME_DIR, ".ssh", "config");
exports.SSH_CONFIG_BACKUP_PATH = path.join(exports.HOME_DIR, ".ssh", "config.backup");
// SSH key settings
exports.DEFAULT_KEY_TYPE = "ed25519";
exports.DEFAULT_KEY_BITS = 4096;
exports.DEFAULT_KDF_ROUNDS = 100;
// Project config
exports.DEFAULT_PROJECT = "default";
// Connection settings
exports.SERVER_ALIVE_INTERVAL = 60;
exports.SERVER_ALIVE_COUNT_MAX = 120;
// Security settings
exports.SSH_KEY_PERMISSIONS = 0o600; // Read/write for owner only
exports.SSH_PUB_KEY_PERMISSIONS = 0o644; // Read for everyone, write for owner
exports.SSH_DIR_PERMISSIONS = 0o700; // Read/write/execute for owner only
// Agent settings
exports.DEFAULT_AGENT_TIMEOUT = 28800; // 8 hours in seconds
// UI settings
exports.SPINNER_INTERVAL = 80;
exports.LOG_LEVELS = {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    SUCCESS: "success",
};
//# sourceMappingURL=constants.js.map