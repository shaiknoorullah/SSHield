/** @format */

import * as os from "os"
import * as path from "path"

// App name and version
export const APP_NAME = "sshield"
export const APP_VERSION = "1.0.0"

// Base directories
export const HOME_DIR = os.homedir()
export const BASE_DIR = path.join(HOME_DIR, ".sshield")
export const KEYS_DIR = path.join(BASE_DIR, "keys")
export const CONFIG_DIR = path.join(BASE_DIR, "config")
export const LOGS_DIR = path.join(BASE_DIR, "logs")
export const PROJECTS_DIR = path.join(BASE_DIR, "projects")

// Config files
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")
export const ACTIVE_PROJECT_FILE = path.join(CONFIG_DIR, "active-project")
export const SSH_CONFIG_PATH = path.join(HOME_DIR, ".ssh", "config")
export const SSH_CONFIG_BACKUP_PATH = path.join(
	HOME_DIR,
	".ssh",
	"config.backup"
)

// SSH key settings
export const DEFAULT_KEY_TYPE = "ed25519"
export const DEFAULT_KEY_BITS = 4096
export const DEFAULT_KDF_ROUNDS = 100

// Project config
export const DEFAULT_PROJECT = "default"

// Connection settings
export const SERVER_ALIVE_INTERVAL = 60
export const SERVER_ALIVE_COUNT_MAX = 120

// Security settings
export const SSH_KEY_PERMISSIONS = 0o600 // Read/write for owner only
export const SSH_PUB_KEY_PERMISSIONS = 0o644 // Read for everyone, write for owner
export const SSH_DIR_PERMISSIONS = 0o700 // Read/write/execute for owner only

// Agent settings
export const DEFAULT_AGENT_TIMEOUT = 28800 // 8 hours in seconds

// UI settings
export const SPINNER_INTERVAL = 80
export const LOG_LEVELS = {
	DEBUG: "debug",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
	SUCCESS: "success",
}
