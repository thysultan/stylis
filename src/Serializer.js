import {IMPORT, COMMENT, RULESET, DECLARATION} from './Enum.js'
import {sizeof} from './Utility.js'

/**
 * @param {object[]} children
 * @return {string}
 */
export function serializelist (children) {
	var output = ''
	var object = null
	var length = sizeof(children)

	for (var i = 0; i < length; i++)
		output += stringify((object = children[i]).value, object.type, object.props, object.children)

	return output
}

/**
 * @param {object} root
 * @return {string}
 */
export function serialize (root) {
	return serializelist(root.children)
}

/**
 * @param {string} value
 * @param {string} type
 * @param {string[]} props
 * @param {object[]} children
 * @return {string}
 */
export function stringify (value, type, props, children) {
	switch (type) {
		case DECLARATION:
			return value + ';'
		case RULESET:
			return sizeof(children) ? props.join(',') + '{' + serializelist(children) + '}' : ''
		case COMMENT:
			return ''
		case IMPORT:
			return value + ';'
	}

	return value + '{' + serializelist(children) + '}'
}
