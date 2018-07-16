/**
 * @param {Array<string>} selector
 * @param {Array<string>} declaration
 * @param {Array<string>} ruleset
 */
export function finalize (selector, declaration, ruleset) {
	return declaration.length ? selector.join(',')+'{'+declaration.join(';')+'}' + ruleset.join('') : ruleset.join('')
}
