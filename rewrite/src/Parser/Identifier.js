import {token} from '../Utility.js'

/**
 * @param {Object} read
 * @param {number} char
 * @return {number}
 */
export function identifier (read, char) {
	while (!token(read.peek(0)))
		read.next(char)

	return read.caret
}
