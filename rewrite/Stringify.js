/**
 * @param {Array<string>} selectors
 * @param {Array<string>} declarations
 * @param {Array<string>} rulesets
 */
export function stringify (selectors, declarations, rulesets) {
	return declarations.length ? selectors.join(',')+'{'+declarations.join(';')+'}' + rulesets.join('') : rulesets.join('')
}
