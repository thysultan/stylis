/**
 * @param {string} value
 * @param {Array<number>} current
 * @param {Array<string>} elements
 * @param {Array<string>} parents
 * @param {number} length
 * @param {number} ampersand
 * @return {Array<string>}
 */
export function selector (value, current, elements, parents, length, ampersand) {
	// for each element breakpoint extract element
	for (var i = 0, j = 0, k = -1, x = value, y = 0; i < length; ++i)
		// for each parent prepend to element
		for (x = value.slice(k + 1, k = current[i]), y = 0; y < parents.length; ++y)
			elements[j++] = scope(x, parents[y], ampersand)

	return elements
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
