import { Ora } from "ora";
import blessed from "blessed";
export declare const renderTitle: () => void;
export declare const renderBox: (content: string, title?: string, borderColor?: string) => void;
export declare const createSpinner: (text: string) => Ora;
export declare const log: {
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    success: (message: string) => void;
    table: (data: any[]) => void;
};
export declare const notify: (title: string, message: string, type?: "info" | "success" | "warning" | "error") => void;
export declare const prompt: {
    confirm: (message: string, defaultValue?: boolean) => Promise<boolean>;
    select: <T>(message: string, choices: Array<{
        name: string;
        value: T;
    }>, defaultValue?: T) => Promise<T>;
    input: (message: string, defaultValue?: string, validate?: (input: string) => boolean | string) => Promise<string>;
    password: (message: string, validate?: (input: string) => boolean | string) => Promise<string>;
    checkbox: <T>(message: string, choices: Array<{
        name: string;
        value: T;
        checked?: boolean;
    }>) => Promise<T[]>;
};
export declare const createDashboard: () => blessed.Widgets.Screen;
export declare const createDashboardBox: (screen: blessed.Widgets.Screen, title: string, options?: blessed.Widgets.BoxOptions) => blessed.Widgets.BoxElement;
export declare const createDashboardList: (screen: blessed.Widgets.Screen, title: string, items: string[], options?: blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle>) => blessed.Widgets.ListElement;
export declare const formatKeyValueList: (data: Record<string, any>, indent?: number) => string;
export declare const createProgressBar: (screen: blessed.Widgets.Screen, options?: blessed.Widgets.ProgressBarOptions) => blessed.Widgets.ProgressBarElement;
