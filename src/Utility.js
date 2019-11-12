/**
 * @param {number}
 * @return {string}
 */
export var from = String.fromCharCode

/**
 * @param {number} code
 * @return {number}
 */
export function token (code) {
	switch (code) {
		// \0 \t \s \n
		case 0: case 9: case 32: case 10:
		// @ > + ~ : , ! /
		case 64: case 62: case 43: case 126: case 58: case 44: case 33: case 47:
		// { } ;
		case 123: case 125: case 59:
			return 2
		// ( )
		case 40: case 41:
			return 1
	}

	return 0
}

/**
 * @param {string} string
 * @param {(string|RegExp)} pattern
 * @param {string} replacement
 * @return {string}
 */
export function replace (string, pattern, replacement) {
	return string.replace(pattern, replacement)
}

/**
 * @param {string} string
 * @param {number} length
 * @param {number} seed
 * @return {number}
 */
export function hash (string, length, seed) {
	for (var i = 0, h = seed|0; i < length; ++i)
		h = (h << 2) ^ charat(string, i)

	return h
}

/**
 * @param {string} string
 * @param {(string|RegExp)} pattern
 * @return {boolean}
 */
export function test (string, pattern) {
	return pattern.test(string)
}

/**
 * @param {string} string
 * @param {string} value
 * @return {number}
 */
export function indexof (string, value) {
	return string.indexOf(value)
}

/**
 * @param {string} string
 * @return {string}
 */
export function trim (string) {
	return string.trim()
}

/**
 * @param {string} string
 * @param {number} index
 * @return {number}
 */
export function charat (string, index) {
	return string.charCodeAt(index) | 0
}

/**
 * @param {string} string
 * @return {number}
 */
export function strlen (string) {
	return string.length
}

/**
 * @param {string} string
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function substr (string, begin, end) {
	return string.slice(begin, end)
}

/**
 * @param {Array<*>} array
 * @return {number}
 */
export function sizeof (array) {
	return array.length
}

/**
 * @param {Array<*>} array
 * @param {*} value
 * @return {number}
 */
export function push (array, value) {
	return array.push(value)
}

/**
 * @param {Array<*>} array
 * @param {Array<*>} value
 * @param {number} length
 * @return {void}
 */
export function concat (array, value, length) {
	for (var i = 0; i < length; i++)
		push(array, value[i])
}

/**
 * @param {Object} read
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function slice (read, begin, end) {
	return substr(read.value, begin, end)
}

/**
 * @param {Object} read
 * @param {number} code
 * @return {number}
 */
export function next (read, code) {
	var char = charat(read.value, read.caret++)

	if (read.column++, char === 10)
		read.column = 1, read.line++

	return char
}

/**
 * @param {Object} read
 * @param {number} distance
 * @return {number}
 */
export function peek (read, distance) {
	return charat(read.value, read.caret + distance)
}

/**
 * @param {Object} read
 * @return {number}
 */
export function caret (read) {
	return read.caret
}

/**
 * @return {Object}
 */
export function source (read) {
	return {'line': read.line, 'column': read.column, 'caret': read.caret}
}

/**
 * @param {string} type
 * @param {*} props
 * @param {*} children
 * @param {string} value
 * @param {*} source
 * @param {Object} source
 */
export function node (type, props, children, value, source) {
	return {'type': type, 'props': props, 'children': children, 'value': value, 'source': source}
}

/**
 * @param {string} value
 * @return {Object}
 */
export function read (value) {
	return {'value': value, 'line': 1, 'column': 1, 'caret': 0}
}
