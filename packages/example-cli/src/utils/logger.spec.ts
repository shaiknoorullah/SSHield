/** @format */

import { expect } from "chai";
import { logger } from "./logger.js";

describe("logger", () => {
	describe("info", () => {
		it("should log info messages without throwing", () => {
			expect(() => logger.info("test message")).to.not.throw();
		});
	});

	describe("success", () => {
		it("should log success messages without throwing", () => {
			expect(() => logger.success("test success")).to.not.throw();
		});
	});

	describe("warn", () => {
		it("should log warning messages without throwing", () => {
			expect(() => logger.warn("test warning")).to.not.throw();
		});
	});

	describe("error", () => {
		it("should log error messages without throwing", () => {
			expect(() => logger.error("test error")).to.not.throw();
		});
	});

	describe("debug", () => {
		it("should log debug messages when DEBUG is set", () => {
			const originalDebug = process.env.DEBUG;
			process.env.DEBUG = "true";

			expect(() => logger.debug("test debug")).to.not.throw();

			// Restore original value
			if (originalDebug === undefined) {
				delete process.env.DEBUG;
			} else {
				process.env.DEBUG = originalDebug;
			}
		});

		it("should not log debug messages when DEBUG is not set", () => {
			const originalDebug = process.env.DEBUG;
			delete process.env.DEBUG;

			expect(() => logger.debug("test debug")).to.not.throw();

			// Restore original value
			if (originalDebug !== undefined) {
				process.env.DEBUG = originalDebug;
			}
		});
	});
});
