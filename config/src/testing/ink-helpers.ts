/** @format */

/**
 * Ink testing library helpers for SSHield packages
 * Provides utilities for testing Ink/React CLI components
 */

import type { ReactElement } from "react";

/**
 * Custom matchers for Ink component testing
 */
export const inkMatchers = {
  /**
   * Assert that the output contains a specific text
   */
  toContainText: (received: string, expected: string): boolean => {
    return received.includes(expected);
  },

  /**
   * Assert that the output matches a regex pattern
   */
  toMatchPattern: (received: string, pattern: RegExp): boolean => {
    return pattern.test(received);
  },

  /**
   * Assert that the output contains ANSI color codes
   */
  toHaveColor: (received: string): boolean => {
    // ANSI escape code pattern
    const ansiPattern = /\u001b\[\d+m/;
    return ansiPattern.test(received);
  },

  /**
   * Assert that the output is empty
   */
  toBeEmpty: (received: string): boolean => {
    return received.trim() === "";
  },
};

/**
 * Wait for a specific output in Ink component
 */
export async function waitForText(
  lastFrame: () => string,
  text: string,
  timeout = 5000,
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const output = lastFrame();

      if (output.includes(text)) {
        clearInterval(interval);
        resolve();
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(
          new Error(
            `Timeout waiting for text "${text}". Last output: ${output}`,
          ),
        );
      }
    }, 100);
  });
}

/**
 * Strip ANSI codes from string for easier testing
 */
export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[\d+m/g, "");
}

/**
 * Get the last N lines from output
 */
export function getLastLines(output: string, count: number): string {
  const lines = output.split("\n");
  return lines.slice(-count).join("\n");
}

/**
 * Get the first N lines from output
 */
export function getFirstLines(output: string, count: number): string {
  const lines = output.split("\n");
  return lines.slice(0, count).join("\n");
}

/**
 * Count occurrences of text in output
 */
export function countOccurrences(output: string, text: string): number {
  const regex = new RegExp(text, "g");
  const matches = output.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Type for render result from ink-testing-library
 */
export interface RenderResult {
  lastFrame: () => string;
  frames: string[];
  stdin: {
    write: (data: string) => void;
  };
  rerender: (element: ReactElement) => void;
  unmount: () => void;
  cleanup: () => void;
}

/**
 * Mock stdin for testing interactive components
 */
export class MockStdin {
  private listeners: Array<(data: string) => void> = [];

  on(event: string, listener: (data: string) => void): this {
    if (event === "data") {
      this.listeners.push(listener);
    }
    return this;
  }

  write(data: string): void {
    this.listeners.forEach((listener) => listener(data));
  }

  clear(): void {
    this.listeners = [];
  }
}

/**
 * Simulate user input
 */
export function simulateInput(
  stdin: { write: (data: string) => void },
  keys: string[],
  delay = 100,
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    const interval = setInterval(() => {
      if (index < keys.length) {
        stdin.write(keys[index]);
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, delay);
  });
}

/**
 * Common key codes for testing
 */
export const Keys = {
  ENTER: "\r",
  ESCAPE: "\x1B",
  UP: "\x1B[A",
  DOWN: "\x1B[B",
  LEFT: "\x1B[D",
  RIGHT: "\x1B[C",
  BACKSPACE: "\x7F",
  DELETE: "\x1B[3~",
  TAB: "\t",
  SPACE: " ",
  CTRL_C: "\x03",
  CTRL_D: "\x04",
};

/**
 * Example test setup
 *
 * import { render } from 'ink-testing-library'
 * import { expect } from 'chai'
 * import { waitForText, stripAnsi, Keys } from '@sshield/config/testing'
 *
 * describe('MyComponent', () => {
 *   it('renders welcome message', async () => {
 *     const { lastFrame } = render(<MyComponent />)
 *     await waitForText(lastFrame, 'Welcome')
 *     const output = stripAnsi(lastFrame())
 *     expect(output).to.include('Welcome')
 *   })
 * })
 */
