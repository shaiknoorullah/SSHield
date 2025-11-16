/** @format */

import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { HelloWorld } from "../components/HelloWorld.js";
import { logger } from "../utils/logger.js";

export const helloCommand = new Command("hello")
	.description("Display a friendly hello message with Ink UI")
	.option("-n, --name <name>", "Name to greet", "World")
	.action((options) => {
		logger.info(`Starting hello command for: ${options.name}`);

		const { unmount } = render(<HelloWorld name={options.name} />);

		// Auto-unmount after displaying the message
		setTimeout(() => {
			unmount();
			logger.success("Hello command completed");
		}, 2000);
	});
