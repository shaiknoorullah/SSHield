import { CommandOptions } from "../types";
/**
 * Initialize the application
 */
export declare const initializeApplication: (options: {
    force?: boolean;
    projectName?: string;
    skipIntro?: boolean;
} & CommandOptions) => Promise<void>;
/**
 * Check if the application is already initialized
 */
export declare const isInitialized: () => Promise<boolean>;
/**
 * Show application status
 */
export declare const showStatus: (options?: CommandOptions) => Promise<void>;
