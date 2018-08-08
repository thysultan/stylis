export var abs = Math.abs
export var str = String.fromCharCode

/**
 * @param {number} code
 * @return {number}
 */
export function token (code) {
	switch (code) {
		// \0 \t \s \n
		case 0: case 9: case 32: case 10:
		// @ > + * ~ : , ! /
		case 64: case 62: case 43: case 42: case 126: case 58: case 44: case 33: case 47:
		// { } ; " '
		case 123: case 125: case 59: case 34: case 39:
			return 2
		// [ (
		case 91: case 40:
			return 1
	}

	return 0
}

/**
 * @param {string} str
 * @param {number} length
 * @param {number} seed
 * @return {number}
 */
export function hash (str, length, seed) {
	for (var i = 0, h = seed|0; i < length; ++i)
		h = (h << 2) ^ charat(str, i)

	return h
}

/**
 * @param {string} str
 * @return {string}
 */
export function trim (str) {
	return str.trim()
}

/**
 * @param {string} str
 * @param {number} i
 * @return {number}
 */
export function charat (str, i) {
	return str.charCodeAt(i)|0
}

/**
 * @param {string} str
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function substr (str, begin, end) {
	return str.slice(begin, end)
}

/**
 * @param {string} str
 * @return {number}
 */
export function strlen (str) {
	return str.length
}

/**
 * @param {Array<*>} arr
 * @return {number}
 */
export function sizeof (arr) {
	return arr.length
}

/**
 * @param {Array<*>} arr
 * @param {*} value
 * @return {number}
 */
export function push (arr, value) {
	return arr.push(value)
}

/**
 * @param {*} type
 * @param {*} props
 * @param {*} children
 * @param {string} value
 * @param {*} source
 */
export function node (type, props, children, value, source) {
	return {type: type, props: props, children: children, value: value, source: source}
}

/**
 * @return {Object}
 */
export function src (read) {
	return {line: read.line, column: read.column, caret: read.caret}
}
