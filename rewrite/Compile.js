/**
 * @param {string} value
 * @return {string}
 */
function compile (value) {
	return parse([], 0, iterator(value))
}
