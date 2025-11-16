/** @format */

import { render } from "ink-testing-library";
import { expect } from "chai";
import React from "react";
import { HelloWorld } from "./HelloWorld.js";

describe("HelloWorld Component", () => {
	it("should render with default name", () => {
		const { lastFrame } = render(<HelloWorld name="World" />);
		const output = lastFrame();

		expect(output).to.include("Hello, World!");
	});

	it("should render with custom name", () => {
		const { lastFrame } = render(<HelloWorld name="SSHield" />);
		const output = lastFrame();

		expect(output).to.include("Hello, SSHield!");
	});

	it("should display monorepo tooling features", () => {
		const { lastFrame } = render(<HelloWorld name="Test" />);
		const output = lastFrame();

		expect(output).to.include("TypeScript");
		expect(output).to.include("Ink");
		expect(output).to.include("Commander.js");
	});

	it("should include emoji in greeting", () => {
		const { lastFrame } = render(<HelloWorld name="Test" />);
		const output = lastFrame();

		expect(output).to.include("👋");
	});
});
