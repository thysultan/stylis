import {IMPORT, RULESET, DECLARATION} from './Enum.js'
import {sizeof} from './Utility.js'

/**
 * @param {object[]} children
 * @param {function} callback
 * @return {string}
 */
export function serialize (children, callback) {
	var output = ''

	for (var i = 0; i < sizeof(children); i++)
		output += callback(children[i], i, children, callback) || ''

	return output
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 * @return {string}
 */
export function stringify (element, index, children, callback) {
	var output = element.return
	var prefix = element.prefix || ''

	switch (element.type) {
		case IMPORT: case DECLARATION: return element.return = output || prefix + element.value
		case RULESET: element.value = element.props.join(',')
	}

	if (!output)
		if (children = serialize(element.children, callback))
			output = prefix + element.value + '{' + children + '}'

	return element.prefix === null ? output : element.return = output
}
