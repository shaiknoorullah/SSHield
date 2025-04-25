import * as path from "path";
import * as os from "os";
import { CommandOptions } from "../types";
import {
  BASE_DIR,
  CONFIG_DIR,
  KEYS_DIR,
  LOGS_DIR,
  PROJECTS_DIR,
  DEFAULT_PROJECT,
  APP_NAME,
  APP_VERSION,
} from "../constants";
import {
  initializeApp,
  loadConfig,
  createProject,
  saveProject,
  setActiveProject,
} from "../utils/config";
import { ensureDirectory } from "../utils/filesystem";
import {
  log,
  prompt,
  createSpinner,
  renderTitle,
  renderBox,
  formatKeyValueList,
} from "../utils/ui";

/**
 * Initialize the application
 */
export const initializeApplication = async (
  options: {
    force?: boolean;
    projectName?: string;
    skipIntro?: boolean;
  } & CommandOptions
): Promise<void> => {
  try {
    // Show app title
    if (!options.skipIntro) {
      renderTitle();
    }

    // Show a welcome message
    if (!options.skipIntro && !options.json) {
      log.info(`Welcome to ${APP_NAME} v${APP_VERSION}!`);
      log.info(
        "This wizard will help you set up your SSH key management environment."
      );
      console.log("");
    }

    // Check if force flag is set or confirm initialization
    const shouldInitialize =
      options.force ||
      (!options.json &&
        (await prompt.confirm(
          "This will initialize the application and create the necessary directories. Continue?",
          true
        )));

    if (!shouldInitialize) {
      log.info("Initialization cancelled.");
      return;
    }

    // Show a spinner while initializing
    const spinner = createSpinner("Initializing application...");
    spinner.start();

    // Create required directories
    await Promise.all([
      ensureDirectory(BASE_DIR),
      ensureDirectory(CONFIG_DIR),
      ensureDirectory(KEYS_DIR),
      ensureDirectory(PROJECTS_DIR),
      ensureDirectory(LOGS_DIR),
    ]);

    // Initialize the application
    await initializeApp(options.force);

    spinner.succeed("Application initialized successfully");

    // Create a project if name is provided or prompt for one
    let projectName = options.projectName;

    if (!projectName && !options.json) {
      projectName = await prompt.input(
        "Enter a name for your first project:",
        "default"
      );
    }

    if (projectName && projectName !== DEFAULT_PROJECT) {
      const projectSpinner = createSpinner(
        `Creating project "${projectName}"...`
      );
      projectSpinner.start();

      // Create the project
      const project = await createProject(projectName);

      // Set as active project
      await setActiveProject(project.id);

      projectSpinner.succeed(
        `Project "${projectName}" created and set as active`
      );
    }

    // Show summary of the initialization
    if (!options.json) {
      renderBox(
        formatKeyValueList({
          Application: `${APP_NAME} v${APP_VERSION}`,
          "Base Directory": BASE_DIR,
          "Config Directory": CONFIG_DIR,
          "Keys Directory": KEYS_DIR,
          "Projects Directory": PROJECTS_DIR,
          "Active Project": projectName || DEFAULT_PROJECT,
        }),
        "Initialization Complete",
        "green"
      );

      // Show next steps
      log.info("\nNext Steps:");
      log.info("1. Generate SSH keys using the `key generate` command");
      log.info("2. Add servers using the `server add` command");
      log.info("3. Connect to your servers using the `connect` command");
      log.info("\nFor more information, run `ssh-manager --help`");
    }
  } catch (error: any) {
    log.error(`Failed to initialize application: ${error.message}`);
    throw error;
  }
};

/**
 * Check if the application is already initialized
 */
export const isInitialized = async (): Promise<boolean> => {
  try {
    await loadConfig();
    return true;
  } catch {
    return false;
  }
};

/**
 * Show application status
 */
export const showStatus = async (
  options: CommandOptions = {}
): Promise<void> => {
  try {
    // Check if the application is initialized
    const initialized = await isInitialized();

    if (!initialized) {
      log.warn(
        "Application is not initialized. Run `ssh-manager init` to set up."
      );
      return;
    }

    // Load configuration
    const config = await loadConfig();

    // Show application status
    if (!options.json) {
      renderBox(
        formatKeyValueList({
          Application: `${APP_NAME} v${APP_VERSION}`,
          Status: "Initialized",
          "Base Directory": BASE_DIR,
          "Default Project": config.defaultProject,
          "Active Project": config.activeProject || config.defaultProject,
          Projects: config.projects.length,
        }),
        "Application Status",
        "blue"
      );
    }
  } catch (error: any) {
    log.error(`Failed to show application status: ${error.message}`);
    throw error;
  }
};
