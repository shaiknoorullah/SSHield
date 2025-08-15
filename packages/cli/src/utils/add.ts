/** @format */

export interface SumParams {
	a: number
	b: number
}

export const sum = ({ a, b }: SumParams): number => {
	return a + b
}
