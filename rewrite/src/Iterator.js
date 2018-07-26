import {codeof} from './Utility.js'

/**
 * @param {string} value
 * @param {string} uuid
 * @param {*} state
 * @return {object}
 */
export function iterator (value, uuid, state) {
	return {index: 0, line: 1, column: 1, value: value, next: next, peek: peek, caret: caret, slice: slice}
}

/**
 * @return {number}
 */
export function next () {
	var code = codeof(this.value, this.index++)

	if (++this.column, code === 10)
		++this.line, this.column = 1

	return code
}

/**
 * @return {number}
 */
export function peek () {
	return codeof(this.value, this.index)
}

/**
 * @return {number}
 */
export function caret () {
	return this.index
}

/**
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function slice (begin, end) {
	return this.value.slice(begin, end)
}
