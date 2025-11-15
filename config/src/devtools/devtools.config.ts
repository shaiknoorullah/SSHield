/** @format */

/**
 * React DevTools configuration for Ink CLI applications
 * Enables debugging of Ink components with React DevTools
 */
interface DevToolsConfig {
  enabled?: boolean;
  host?: string;
  port?: number;
  useHttps?: boolean;
  websocket?: boolean;
}

const devtoolsConfig: DevToolsConfig = {
  // Enable DevTools by default in development
  enabled: process.env["NODE_ENV"] !== "production",

  // DevTools server host
  host: "localhost",

  // DevTools server port
  port: 8097,

  // Use HTTPS
  useHttps: false,

  // Use WebSocket connection
  websocket: true,
};

/**
 * Initialize React DevTools for Ink
 * Usage in your CLI entry point:
 *
 * import { initDevTools } from '@sshield/config/devtools'
 *
 * if (process.env.DEV) {
 *   await initDevTools()
 * }
 */
export async function initDevTools(
  config: Partial<DevToolsConfig> = {},
): Promise<void> {
  const finalConfig = { ...devtoolsConfig, ...config };

  if (!finalConfig.enabled) {
    return;
  }

  try {
    // Dynamic import to avoid bundling in production
    // @ts-ignore - react-devtools-core doesn't have types
    const { default: DevTools } = await import("react-devtools-core");

    DevTools.connectToDevTools({
      host: finalConfig.host,
      port: finalConfig.port,
      useHttps: finalConfig.useHttps,
      websocket: finalConfig.websocket,
    });

    console.log(
      `React DevTools connected on ${finalConfig.host}:${finalConfig.port}`,
    );
  } catch (error) {
    console.warn("Failed to initialize React DevTools:", error);
  }
}

export default devtoolsConfig;
export type { DevToolsConfig };
