/** @format */

import { sum } from "./add"
import { expect } from "chai"
import sinon from "sinon"
import "mocha"

describe("check_if_sum_adds_two_positive_integers", () => {
	it("should add two positive integers", () => {
		const result = sum({ a: 2, b: 3 })
		expect(result).to.equal(5)
	})

	it("should call a callback with the sum result (using sinon spy)", () => {
		const callback = sinon.spy()
		const params = { a: 4, b: 6 }
		const result = sum(params)
		callback(result)
		expect(callback.calledOnce).to.be.true
		expect(callback.calledWith(10)).to.be.true
	})
})
