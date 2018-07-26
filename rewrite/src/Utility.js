export const absof = Math.abs
export const charof = String.fromCharCode

/**
 * @param {string} value
 * @param {number} index
 * @return {number}
 */
export function codeof (value, index) {
	return value.charCodeAt(index)
}

/**
 * @param {string} value
 * @return {number}
 */
export function sizeof (value) {
	return value.length
}

/**
 * @param {string} value
 * @param {number} seed
 * @param {number} length
 * @return {number}
 */
export function hashof (value, seed, length) {
	for (var i = 0; i < length; ++i)
		seed = (seed << 2) ^ codeof(value, i)

	return seed
}

/**
 * @param {number} char
 * @return {number}
 */
export function tokenof (char) {
	switch (char) {
		// \0 \t \s \n \r \v \f
		case 0: case 9: case 32: case 10: case 13: case 11: case 12:
		// { } ; : , [ ( " ' ! @ /
		case 123: case 125: case 59: case 58: case 44: case 91: case 40: case 34: case 39: case 33: case 64: case 47:
			return 1
	}

	return 0
}
