/** @format */

import { Box, Text } from "ink";
import React from "react";

export interface HelloWorldProps {
	name: string;
}

export const HelloWorld: React.FC<HelloWorldProps> = ({ name }) => {
	return (
		<Box
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			flexDirection="column"
		>
			<Text bold color="green">
				Hello, {name}! 👋
			</Text>
			<Text dimColor>
				This is an example CLI built with SSHield monorepo tooling.
			</Text>
			<Box marginTop={1}>
				<Text>
					✓ <Text color="yellow">TypeScript</Text> for type safety
				</Text>
			</Box>
			<Box>
				<Text>
					✓ <Text color="cyan">Ink</Text> for beautiful terminal UIs
				</Text>
			</Box>
			<Box>
				<Text>
					✓ <Text color="magenta">Commander.js</Text> for CLI parsing
				</Text>
			</Box>
		</Box>
	);
};
