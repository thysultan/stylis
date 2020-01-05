import {IMPORT, COMMENT, RULESET, KEYFRAMES, DECLARATION} from './Enum.js'
import {strlen, sizeof} from './Utility.js'
import {prefix} from './Prefixer.js'

/**
 * @param {object[]} children
 * @return {string}
 */
export function serialize (children) {
	var output = ''
	var object = null
	var length = sizeof(children)

	for (var i = 0; i < length; i++)
		output += stringify((object = children[i]).value, object.type, object.props, object.children)

	return output
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
			return prefix(value + ';', props.length)
		case RULESET:
			return sizeof(children) ? props.join(',') + '{' + serialize(children) + '}' : ''
		case COMMENT:
			return ''
		case IMPORT:
			return value + ';'
	}

	return value + '{' + serialize(children) + '}'
}
