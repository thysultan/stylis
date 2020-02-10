import {from, trim, strlen, charat, substr, append} from './Utility.js'

export var line = 1
export var column = 1
export var length = 0
export var position = 0
export var character = 0
export var temporary = ''

/**
 * @param {string[]} children
 * @return {string[]}
 */
export function tokenize (children) {
	while (scan())
		switch (token(character)) {
			case 0: append(identifier(caret() - 1), children)
				break
			case 2: append(delimiter(character), children)
			case 4:
				break
			default: append(from(character), children)
		}

	return children
}

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
export function scan () {
	character = position < length ? charat(temporary, position++) : 0

	if (column++, character === 10)
		column = 1, line++

	return character
}

/**
 * @return {number}
 */
export function peek () {
	return charat(temporary, position)
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
		// * /
		case 42: case 47:
			return 5
		// \0 \t \n \s
		case 0: case 9: case 10: case 32:
			return 4
		// ! + , / : > @ ~
		case 33: case 43: case 44: case 58: case 62: case 64: case 126:
		// ; { }
		case 59: case 123: case 125:
			return 3
		// " ' ( [
		case 34: case 39: case 40: case 91:
			return 2
		// ) ]
		case 41: case 93:
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
		// - d m s
		case 45: case 100: case 109: case 115:
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
 * @return {any[]}
 */
export function alloc (value) {
	return line = column = 1, length = strlen(temporary = value), position = 0, []
}

/**
 * @param {any} value
 * @return {any}
 */
export function dealloc (value) {
	return temporary = '', value
}

/**
 * @param {number} type
 * @return {number}
 */
export function delimit (type) {
	while (scan())
		switch (character) {
			// \0 ] ) " '
			case 0: case type:
				return caret()
			// " '
			case 34: case 39:
				return delimit(type === 34 || type === 39 ? type : character)
			// (
			case 40:
				if (type === 41)
					delimit(type)
				break
			// \
			case 92:
				scan()
				break
		}
}

/**
 * @param {number} type
 * @return {string}
 */
export function delimiter (type) {
	return trim(slice(caret() - 1, delimit(type === 91 ? type + 2 : type === 40 ? type + 1 : type)))
}

/**
 * @param {number} type
 * @return {string}
 */
export function whitespace (type) {
	while ((character = peek()) < 33)
		scan()

	return token(type) > 2 || token(character) > 2 ? '' : ' '
}

/**
 * @param {number} index
 * @return {string}
 */
export function identifier (index) {
	while (!token(peek()))
		scan()

	return slice(index, caret())
}
