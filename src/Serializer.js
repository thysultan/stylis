import {IMPORT, COMMENT, RULESET, DECLARATION} from './Enum.js'
import {sizeof, strlen} from './Utility.js'

/**
 * @param {object[]} children
 * @param {function} callack
 * @return {string}
 */
export function serialize (children, callback) {
	var output = ''
	var length = sizeof(children)

	for (var i = 0; i < length; i++)
		output += callback(children[i], callback) || ''

	return output
}

/**
 * @param {object} element
 * @param {function} callback
 * @return {string}
 */
export function stringify (element, callback) {
	var output = ''
	var string = element.value

	switch (element.type) {
		case IMPORT: case DECLARATION: return string
		case COMMENT: return output
		case RULESET: string = element.props.join(',')
	}

	return strlen(output = serialize(element.children, callback)) ? string + '{' + output + '}' : ''
}
