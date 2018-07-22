/**
 * @param {string} value
 * @param {string} parent
 * @param {number} ampersand
 * @param {string} uuid
 * @param {*} state
 * @return {string}
 */
export function selector (value, parent, ampersand, uuid, state) {
	return ampersand > 0 ? parent + ' ' + value : value.replace(/&/g, parent)
}
