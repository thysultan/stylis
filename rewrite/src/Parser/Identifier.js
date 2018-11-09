import {token, next, peek, slice, caret} from '../Utility.js'

/**
 * @param {Object} read
 * @param {number} type
 * @return {string}
 */
export function identifier (read, type) {
	var index = caret(read)

	while (!token(peek(read, 0)))
		next(read, type)

	return slice(read, index, caret(read))
}
