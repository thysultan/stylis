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
		output += callback(children[i], callback)

	return output
}

/**
 * @param {object} element
 * @param {function} callback
 * @return {string}
 */
export function stringify (element, callback) {
	var value = element.value
	var props = element.props
	var children = element.children

	switch (element.type) {
		case IMPORT: case DECLARATION:
			return value + ';'
		case COMMENT:
			return ''
		case RULESET:
			value = props.join(',')
	}

	return strlen(children = sizeof(children) ? serialize(children, callback) : '') ? value + '{' + children + '}' : children
}
