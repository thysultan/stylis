import {trim, strlen, charat, substr} from './Utility.js'

var line = 1
var column = 1
var length = 0
var position = 0
var character = 0
var temporary = ''

/**
 * @param {string} value
 * @param {string} type
 * @param {string[]} props
 * @param {object[]} children
 */
export function node (value, type, props, children) {
	return {value: value, type: type, props: props, children: children, line: line, column: column, caret: position}
}

/**
 * @return {number}
 */
export function next () {
	character = position < length ? charat(temporary, position++) : 0

	if (column++, character === 10)
		column = 1, line++

	return character
}

/**
 * @param {number} distance
 * @return {number}
 */
export function peek (distance) {
	return charat(temporary, position + distance)
}

/**
 * @return {number}
 */
export function caret () {
	return position
}

/**
 * @param {number} type
 * @return {number}
 */
export function token (type) {
	switch (type) {
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
 * @param {number} type
 * @return {number}
 */
export function attoken (type) {
	switch (type) {
		// m(edia), s(upports), d(ocument), -(moz-document)
		case 109: case 115: case 100: case 45:
			return 0
	}

	return 1
}

/**
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function slice (begin, end) {
	return substr(temporary, begin, end)
}

/**
 * @param {string} value
 * @return {number}
 */
export function alloc (value) {
	return line = column = 1, length = strlen(temporary = value), position = 0
}

/**
 * @param {object[]} value
 * @return {object[]}
 */
export function dealloc (value) {
	return temporary = '', value
}

/**
 * @param {number} type
 * @return {number}
 */
export function delimit (type) {
	while (character = next())
		if (character === type)
			break
		else if (character === 34 || character === 39)
			delimit(character)

	return caret()
}

/**
 * @param {number} type
 * @return {string}
 */
export function delimiter (type) {
	return trim(slice(caret() - 1, delimit(type)))
}

/**
 * @param {number} type
 * @return {string}
 */
export function whitespace (type) {
	while (character = peek(0))
		if (character > 32)
			break
		else
			next()

	return token(type) > 1 || token(character) > 1 ? '' : ' '
}

/**
 * @param {number} index
 * @return {string}
 */
export function identifier (index) {
	while (!token(peek(0)))
		next()

	return slice(index, caret())
}
