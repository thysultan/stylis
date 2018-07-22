/**
 * @param {Array<string>} rule
 * @param {Array<string>} declaration
 * @param {string} uuid
 * @param {*} state
 */
export function ruleset (rule, children, uuid, state) {
	return rule.join(',') + '{' + children + '}'
}
