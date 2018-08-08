import {substr, charat} from './Utility.js'

/**
 * @param {string} value
 * @return {Object}
 */
export function iterator (value) {
	return {value: value, slice: slice, next: next, peek: peek, line: 1, column: 1, caret: 0}
}

/**
 * @this {Object}
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function slice (begin, end) {
	return substr(this.value, begin, end)
}

/**
 * @this {Object}
 * @param {number} code
 * @return {number}
 */
export function next (code) {
	var char = charat(this.value, this.caret++)

	if (this.column++, char === 10)
		this.column = 1, this.line++

	return char
}

/**
 * @this {Object}
 * @param {number} distance
 * @return {number}
 */
export function peek (distance) {
	return charat(this.value, this.caret + distance)
}
