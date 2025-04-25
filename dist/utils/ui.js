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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProgressBar = exports.formatKeyValueList = exports.createDashboardList = exports.createDashboardBox = exports.createDashboard = exports.prompt = exports.notify = exports.log = exports.createSpinner = exports.renderBox = exports.renderTitle = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const figlet_1 = __importDefault(require("figlet"));
const gradient_string_1 = __importDefault(require("gradient-string"));
const boxen_1 = __importDefault(require("boxen"));
const inquirer_1 = __importDefault(require("inquirer"));
const constants_1 = require("../constants");
const blessed_1 = __importDefault(require("blessed"));
const notifier = __importStar(require("node-notifier"));
const date_fns_1 = require("date-fns");
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
const renderTitle = () => {
    const title = figlet_1.default.textSync("SSH Manager", { font: "Big" });
    const titleGradient = (0, gradient_string_1.default)(["#36c5f0", "#2eb67d", "#ecb22e", "#e01e5a"]);
    console.log(titleGradient(title));
    console.log(chalk_1.default.dim("Secure SSH Key Management | v1.0.0"));
    console.log("");
};
exports.renderTitle = renderTitle;
// Create a styled box for displaying information
const renderBox = (content, title, borderColor = "blue") => {
    console.log((0, boxen_1.default)(content, {
        title,
        titleAlignment: "center",
        padding: 1,
        margin: 1,
        borderColor,
        borderStyle: "round",
    }));
};
exports.renderBox = renderBox;
// Create a spinner with the given text
const createSpinner = (text) => {
    return (0, ora_1.default)({
        text,
        spinner: "dots",
        color: "cyan",
        interval: constants_1.SPINNER_INTERVAL,
    });
};
exports.createSpinner = createSpinner;
// Create a standard way to log messages
exports.log = {
    debug: (message) => {
        console.log(chalk_1.default.dim(`[${getTimestamp()}] ${message}`));
    },
    info: (message) => {
        console.log(chalk_1.default.blue(`[${getTimestamp()}] ℹ️  ${message}`));
    },
    warn: (message) => {
        console.log(chalk_1.default.yellow(`[${getTimestamp()}] ⚠️  ${message}`));
    },
    error: (message) => {
        console.log(chalk_1.default.red(`[${getTimestamp()}] ❌ ${message}`));
    },
    success: (message) => {
        console.log(chalk_1.default.green(`[${getTimestamp()}] ✅ ${message}`));
    },
    table: (data) => {
        console.table(data);
    },
};
// Get timestamp for logging
const getTimestamp = () => {
    return (0, date_fns_1.format)(new Date(), "HH:mm:ss");
};
// Display a notification
const notify = (title, message, type = "info") => {
    notifier.notify({
        title,
        message,
        icon: getIconForType(type),
    });
};
exports.notify = notify;
const getIconForType = (type) => {
    // Return platform-appropriate icons or empty string if not available
    return "";
};
// Interactive prompts
exports.prompt = {
    // Confirm action
    confirm: async (message, defaultValue = false) => {
        const { result } = await inquirer_1.default.prompt([
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
    select: async (message, choices, defaultValue) => {
        const { result } = await inquirer_1.default.prompt([
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
    input: async (message, defaultValue, validate) => {
        const { result } = await inquirer_1.default.prompt([
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
    password: async (message, validate) => {
        const { result } = await inquirer_1.default.prompt([
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
    checkbox: async (message, choices) => {
        const { result } = await inquirer_1.default.prompt([
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
const createDashboard = () => {
    const screen = blessed_1.default.screen({
        smartCSR: true,
        title: "SSH Manager Dashboard",
    });
    // Allow Ctrl+C to exit
    screen.key(["C-c"], () => process.exit(0));
    return screen;
};
exports.createDashboard = createDashboard;
// Create a dashboard box
const createDashboardBox = (screen, title, options = {}) => {
    const box = blessed_1.default.box({
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
exports.createDashboardBox = createDashboardBox;
// Create a dashboard list
const createDashboardList = (screen, title, items, options = {}) => {
    const list = blessed_1.default.list({
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
exports.createDashboardList = createDashboardList;
// Format a list of key-value pairs for display
const formatKeyValueList = (data, indent = 2) => {
    const indentStr = " ".repeat(indent);
    return Object.entries(data)
        .map(([key, value]) => {
        const formattedKey = chalk_1.default.cyan(`${key}:`);
        return `${indentStr}${formattedKey} ${formatValue(value)}`;
    })
        .join("\n");
};
exports.formatKeyValueList = formatKeyValueList;
// Format a value for display
const formatValue = (value) => {
    if (value === undefined || value === null) {
        return chalk_1.default.dim("Not set");
    }
    if (typeof value === "boolean") {
        return value ? chalk_1.default.green("Yes") : chalk_1.default.red("No");
    }
    if (typeof value === "object") {
        if (Array.isArray(value)) {
            return value.length > 0
                ? chalk_1.default.yellow(`[${value.join(", ")}]`)
                : chalk_1.default.dim("Empty array");
        }
        return JSON.stringify(value);
    }
    return String(value);
};
// Progress bar for long operations
const createProgressBar = (screen, options = {}) => {
    const progressBar = blessed_1.default.progressbar({
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
exports.createProgressBar = createProgressBar;
//# sourceMappingURL=ui.js.map