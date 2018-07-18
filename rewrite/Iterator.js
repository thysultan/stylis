/**
 * @return {number}
 */
export function next () {
	var code = this.value.charCodeAt(this.index++)

	switch (++this.column, code) {
		case 10:
			++this.line, this.column = 1
		default:
			return code
	}
}

/**
 * @return {number}
 */
export function peek () {
	return this.value.charCodeAt(this.index)
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
	return this.value.substring(begin, this.index)
}

/**
 * @param {string} value
 * @return {object}
 */
export function iterator (value) {
	return {index: 0, line: 1, column: 1, value: value, next: next, peek: peek, caret: caret, slice: slice}
}
