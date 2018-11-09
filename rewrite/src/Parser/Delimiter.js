import {trim, next, slice, caret} from '../Utility.js'

/**
 * @param {Object} read
 * @param {number} type
 * @return {string}
 */
export function delimiter (read, type) {
	return trim(slice(read, caret(read) - 1, delimit(read, type)))
}

/**
 * @param {Object} read
 * @param {number} type
 * @return {number}
 */
export function delimit (read, type) {
	var char = 0

	while (char = next(read, type))
		if (char == type)
			break
		else if (char == 34 || char == 39)
			delimit(read, char)

	return caret(read)
}
