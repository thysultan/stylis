const {fromCharCode} = String

/**
 * @return {number}
 */
function next () {
	switch (++this.column, this.char = this.value.charCodeAt(this.caret++)) {
		case 10: ++this.line, this.column = 1
		default: return this.char
	}
}

/**
 * @return {number}
 */
function peek () {
	return this.value.charCodeAt(this.caret)
}

/**
 * @param {string} value
 * @return {object}
 */
export function iterator (value) {
	return {char: 0, line: 1, column: 1, caret: 0, value: value, next: next, peek: peek, read: fromCharCode}
}
