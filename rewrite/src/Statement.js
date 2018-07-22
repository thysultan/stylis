/**
 * @param {string} value
 * @param {string} children
 * @param {string} atrule
 * @param {string} uuid
 * @param {*} state
 * @return {string}
 */
export function statement (value, children, atrule, uuid, state) {
	switch (atrule) {
		// @charset @import @namespace
		case 59 ^ 99: case 59 ^ 105: case 59 ^ 110:
			return '\n' + value + ';'
		// @document @media @supports @font-feature-values
		case 100 ^ 123: case 109 ^ 123: case 117 ^ 123: case 101 ^ 123:
			return '\n' + value + '{' + children + '}'
		// @keyframes
		case 107 ^ 123:
			return '\n' + value + '{' + children + '}' + '\n'
		// @font-face
		case 97 ^ 123:
			break
	}

	return value + children
}
