import {token, next, peek} from '../Utility.js'

/**
 * @param {Object} read
 * @param {number} prev
 * @return {string}
 */
export function whitespace (read, prev) {
	var code = 0

	while (code = peek(read, 0))
		if (code > 32) {
			break
		} else {
			next(read, 0)
		}

	return token(prev) > 0 || token(code) > 0 ? '' : ' '
}
