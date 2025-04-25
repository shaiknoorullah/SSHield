import chalk from "chalk";
import ora, { Ora } from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import inquirer from "inquirer";
import { LOG_LEVELS, SPINNER_INTERVAL } from "../constants";
import blessed from "blessed";
import * as notifier from "node-notifier";
import { format } from "date-fns";

// Color palette
const colors = {
  primary: "#36c5f0",
  secondary: "#2eb67d",
  warning: "#ecb22e",
  error: "#e01e5a",
  info: "#4a154b",
  success: "#2eb67d",
  muted: "#6c757d",
};

// Create a beautiful gradient for the app title
export const renderTitle = (): void => {
  const title = figlet.textSync("SSH Manager", { font: "Big" });
  const titleGradient = gradient(["#36c5f0", "#2eb67d", "#ecb22e", "#e01e5a"]);

  console.log(titleGradient(title));
  console.log(chalk.dim("Secure SSH Key Management | v1.0.0"));
  console.log("");
};

// Create a styled box for displaying information
export const renderBox = (
  content: string,
  title?: string,
  borderColor = "blue"
): void => {
  console.log(
    boxen(content, {
      title,
      titleAlignment: "center",
      padding: 1,
      margin: 1,
      borderColor,
      borderStyle: "round",
    })
  );
};

// Create a spinner with the given text
export const createSpinner = (text: string): Ora => {
  return ora({
    text,
    spinner: "dots",
    color: "cyan",
    interval: SPINNER_INTERVAL,
  });
};

// Create a standard way to log messages
export const log = {
  debug: (message: string): void => {
    console.log(chalk.dim(`[${getTimestamp()}] ${message}`));
  },
  info: (message: string): void => {
    console.log(chalk.blue(`[${getTimestamp()}] ℹ️  ${message}`));
  },
  warn: (message: string): void => {
    console.log(chalk.yellow(`[${getTimestamp()}] ⚠️  ${message}`));
  },
  error: (message: string): void => {
    console.log(chalk.red(`[${getTimestamp()}] ❌ ${message}`));
  },
  success: (message: string): void => {
    console.log(chalk.green(`[${getTimestamp()}] ✅ ${message}`));
  },
  table: (data: any[]): void => {
    console.table(data);
  },
};

// Get timestamp for logging
const getTimestamp = (): string => {
  return format(new Date(), "HH:mm:ss");
};

// Display a notification
export const notify = (
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
): void => {
  notifier.notify({
    title,
    message,
    icon: getIconForType(type),
  });
};

const getIconForType = (
  type: "info" | "success" | "warning" | "error"
): string => {
  // Return platform-appropriate icons or empty string if not available
  return "";
};

// Interactive prompts
export const prompt = {
  // Confirm action
  confirm: async (message: string, defaultValue = false): Promise<boolean> => {
    const { result } = await inquirer.prompt([
      {
        type: "confirm",
        name: "result",
        message,
        default: defaultValue,
      },
    ]);
    return result;
  },

  // Select from a list
  select: async <T>(
    message: string,
    choices: Array<{ name: string; value: T }>,
    defaultValue?: T
  ): Promise<T> => {
    const { result } = await inquirer.prompt([
      {
        type: "list",
        name: "result",
        message,
        choices,
        default: defaultValue,
      },
    ]);
    return result;
  },

  // Input text
  input: async (
    message: string,
    defaultValue?: string,
    validate?: (input: string) => boolean | string
  ): Promise<string> => {
    const { result } = await inquirer.prompt([
      {
        type: "input",
        name: "result",
        message,
        default: defaultValue,
        validate,
      },
    ]);
    return result;
  },

  // Input password (masked)
  password: async (
    message: string,
    validate?: (input: string) => boolean | string
  ): Promise<string> => {
    const { result } = await inquirer.prompt([
      {
        type: "password",
        name: "result",
        message,
        validate,
      },
    ]);
    return result;
  },

  // Multiple selection
  checkbox: async <T>(
    message: string,
    choices: Array<{ name: string; value: T; checked?: boolean }>
  ): Promise<T[]> => {
    const { result } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "result",
        message,
        choices,
      },
    ]);
    return result;
  },
};

// Create a simple terminal UI dashboard using blessed
export const createDashboard = (): blessed.Widgets.Screen => {
  const screen = blessed.screen({
    smartCSR: true,
    title: "SSH Manager Dashboard",
  });

  // Allow Ctrl+C to exit
  screen.key(["C-c"], () => process.exit(0));

  return screen;
};

// Create a dashboard box
export const createDashboardBox = (
  screen: blessed.Widgets.Screen,
  title: string,
  options: blessed.Widgets.BoxOptions = {}
): blessed.Widgets.BoxElement => {
  const box = blessed.box({
    label: ` ${title} `,
    border: {
      type: "line",
    },
    style: {
      border: {
        fg: "blue",
      },
      header: {
        fg: "white",
        bold: true,
      },
    },
    ...options,
  });

  screen.append(box);
  return box;
};

// Create a dashboard list
export const createDashboardList = (
  screen: blessed.Widgets.Screen,
  title: string,
  items: string[],
  options: blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle> = {}
): blessed.Widgets.ListElement => {
  const list = blessed.list({
    label: ` ${title} `,
    items,
    border: {
      type: "line",
    },
    style: {
      border: {
        fg: "blue",
      },
      selected: {
        bg: "blue",
        fg: "white",
        bold: true,
      },
    },
    keys: true,
    vi: true,
    mouse: true,
    ...options,
  });

  screen.append(list);
  return list;
};

// Format a list of key-value pairs for display
export const formatKeyValueList = (
  data: Record<string, any>,
  indent = 2
): string => {
  const indentStr = " ".repeat(indent);
  return Object.entries(data)
    .map(([key, value]) => {
      const formattedKey = chalk.cyan(`${key}:`);
      return `${indentStr}${formattedKey} ${formatValue(value)}`;
    })
    .join("\n");
};

// Format a value for display
const formatValue = (value: any): string => {
  if (value === undefined || value === null) {
    return chalk.dim("Not set");
  }

  if (typeof value === "boolean") {
    return value ? chalk.green("Yes") : chalk.red("No");
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.length > 0
        ? chalk.yellow(`[${value.join(", ")}]`)
        : chalk.dim("Empty array");
    }
    return JSON.stringify(value);
  }

  return String(value);
};

// Progress bar for long operations
export const createProgressBar = (
  screen: blessed.Widgets.Screen,
  options: blessed.Widgets.ProgressBarOptions = {}
): blessed.Widgets.ProgressBarElement => {
  const progressBar = blessed.progressbar({
    border: {
      type: "line",
    },
    style: {
      border: {
        fg: "blue",
      },
      bar: {
        bg: "blue",
      },
    },
    height: 3,
    ...options,
  });

  screen.append(progressBar);
  return progressBar;
};
