import {IMPORT, COMMENT, RULESET, DECLARATION} from './Enum.js'
import {strlen, sizeof} from './Utility.js'

/** @typedef {import('./Middleware.js').Element} Element */
/** @typedef {import('./Middleware.js').Middleware} Middleware */

/**
 * @param {Element[]} children
 * @param {Middleware} callback
 * @return {string}
 */
export function serialize (children, callback) {
	var output = ''
	var length = sizeof(children)

	for (var i = 0; i < length; i++)
		output += callback(children[i], i, children, callback) || ''

	return output
}

/**
 * @type {Middleware}
 */
export function stringify (element, index, children, callback) {
	switch (element.type) {
		case IMPORT: case DECLARATION: return element.return = element.return || element.value
		case COMMENT: return ''
		case RULESET: element.value = element.props.join(',')
	}

	return strlen(children = serialize(element.children, callback)) ? element.return = element.value + '{' + children + '}' : ''
}
