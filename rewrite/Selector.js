/**
 * @param {string} value
 * @param {Array<number>} position
 * @param {Array<string>} ancestor
 * @param {number} length
 * @param {number} ampersand
 * @param {number} priority
 * @return {Array<string>}
 */
export function selector (value, position, ancestor, length, ampersand, priority) {
	// for each element breakpoint extract element
	for (var i = 0, j = 0, k = -1, x = value, y = 0, z = ['']; i < length; ++i)
		// for each parent prepend to element
		for (x = value.slice(k + 1, k = position[i]), y = 0; y < ancestor.length; ++y)
			z[j++] = scope(x, ancestor[y], ampersand)

	return z
}

/**
 * @param {string} value
 * @param {string} parent
 * @param {number} ampersand
 * @return {string}
 */
export function scope (value, parent, ampersand) {
	if (ampersand && value.indexOf('&'))
		return value.replace(/&/g, parent)

	return parent + (value.charCodeAt(0) !== 58 ? ' ' : '') + value
}
