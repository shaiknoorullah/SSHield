"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showStatus = exports.isInitialized = exports.initializeApplication = void 0;
const constants_1 = require("../constants");
const config_1 = require("../utils/config");
const filesystem_1 = require("../utils/filesystem");
const ui_1 = require("../utils/ui");
/**
 * Initialize the application
 */
const initializeApplication = async (options) => {
    try {
        // Show app title
        if (!options.skipIntro) {
            (0, ui_1.renderTitle)();
        }
        // Show a welcome message
        if (!options.skipIntro && !options.json) {
            ui_1.log.info(`Welcome to ${constants_1.APP_NAME} v${constants_1.APP_VERSION}!`);
            ui_1.log.info("This wizard will help you set up your SSH key management environment.");
            console.log("");
        }
        // Check if force flag is set or confirm initialization
        const shouldInitialize = options.force ||
            (!options.json &&
                (await ui_1.prompt.confirm("This will initialize the application and create the necessary directories. Continue?", true)));
        if (!shouldInitialize) {
            ui_1.log.info("Initialization cancelled.");
            return;
        }
        // Show a spinner while initializing
        const spinner = (0, ui_1.createSpinner)("Initializing application...");
        spinner.start();
        // Create required directories
        await Promise.all([
            (0, filesystem_1.ensureDirectory)(constants_1.BASE_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.CONFIG_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.KEYS_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.PROJECTS_DIR),
            (0, filesystem_1.ensureDirectory)(constants_1.LOGS_DIR),
        ]);
        // Initialize the application
        await (0, config_1.initializeApp)(options.force);
        spinner.succeed("Application initialized successfully");
        // Create a project if name is provided or prompt for one
        let projectName = options.projectName;
        if (!projectName && !options.json) {
            projectName = await ui_1.prompt.input("Enter a name for your first project:", "default");
        }
        if (projectName && projectName !== constants_1.DEFAULT_PROJECT) {
            const projectSpinner = (0, ui_1.createSpinner)(`Creating project "${projectName}"...`);
            projectSpinner.start();
            // Create the project
            const project = await (0, config_1.createProject)(projectName);
            // Set as active project
            await (0, config_1.setActiveProject)(project.id);
            projectSpinner.succeed(`Project "${projectName}" created and set as active`);
        }
        // Show summary of the initialization
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                Application: `${constants_1.APP_NAME} v${constants_1.APP_VERSION}`,
                "Base Directory": constants_1.BASE_DIR,
                "Config Directory": constants_1.CONFIG_DIR,
                "Keys Directory": constants_1.KEYS_DIR,
                "Projects Directory": constants_1.PROJECTS_DIR,
                "Active Project": projectName || constants_1.DEFAULT_PROJECT,
            }), "Initialization Complete", "green");
            // Show next steps
            ui_1.log.info("\nNext Steps:");
            ui_1.log.info("1. Generate SSH keys using the `key generate` command");
            ui_1.log.info("2. Add servers using the `server add` command");
            ui_1.log.info("3. Connect to your servers using the `connect` command");
            ui_1.log.info("\nFor more information, run `ssh-manager --help`");
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to initialize application: ${error.message}`);
        throw error;
    }
};
exports.initializeApplication = initializeApplication;
/**
 * Check if the application is already initialized
 */
const isInitialized = async () => {
    try {
        await (0, config_1.loadConfig)();
        return true;
    }
    catch {
        return false;
    }
};
exports.isInitialized = isInitialized;
/**
 * Show application status
 */
const showStatus = async (options = {}) => {
    try {
        // Check if the application is initialized
        const initialized = await (0, exports.isInitialized)();
        if (!initialized) {
            ui_1.log.warn("Application is not initialized. Run `ssh-manager init` to set up.");
            return;
        }
        // Load configuration
        const config = await (0, config_1.loadConfig)();
        // Show application status
        if (!options.json) {
            (0, ui_1.renderBox)((0, ui_1.formatKeyValueList)({
                Application: `${constants_1.APP_NAME} v${constants_1.APP_VERSION}`,
                Status: "Initialized",
                "Base Directory": constants_1.BASE_DIR,
                "Default Project": config.defaultProject,
                "Active Project": config.activeProject || config.defaultProject,
                Projects: config.projects.length,
            }), "Application Status", "blue");
        }
    }
    catch (error) {
        ui_1.log.error(`Failed to show application status: ${error.message}`);
        throw error;
    }
};
exports.showStatus = showStatus;
//# sourceMappingURL=init.js.map