#!/usr/bin/env node
/** @format */

import { Command } from "commander";
import { helloCommand } from "./commands/hello.js";

const program = new Command();

program
	.name("example-cli")
	.description("Example CLI demonstrating SSHield monorepo tooling")
	.version("1.0.0");

// Register commands
program.addCommand(helloCommand);

// Parse arguments
program.parse(process.argv);
