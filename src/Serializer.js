import {IMPORT, COMMENT, RULESET, DECLARATION} from './Enum.js'
import {sizeof, strlen} from './Utility.js'

// TODO: Remove this comment
// Example Use:
// serialize(compile(``), stringify) // default
// serialize(compile(``), middleware([prefixer, stringify])) // middlware
// function prefixer (current, callback) { if (current.type === DECLARATION) current.value = prefix(current.value) }

/**
 * @param {object[]} current
 * @param {function} callack
 * @return {string}
 */
export function serialize (current, callback) {
	var output = ''
	var length = sizeof(current)

	for (var i = 0; i < length; i++)
		output += callback(current[i], callback)

	return output
}

/**
 * @param {object[]} current
 * @param {function} callback
 * @return {string}
 */
export function stringify (current, callback) {
	var value = current.value
	var props = current.props
	var children = current.children

	switch (current.type) {
		case IMPORT: case DECLARATION:
			return value + ';'
		case COMMENT:
			return ''
		case RULESET:
			value = props.join(',')
	}

	return sizeof(children) ? value + '{' + serialize(children, callback) + '}' : ''
}

/**
 * @param {string} current
 * @param {string} prefix
 * @param {string} suffix
 * @return {string}
 */
export function content (current, prefix, suffix) {
	return strlen(current) > 0 ? prefix + current + suffix : ''
}

/**
 * @param {function[]} current
 * @return {function}
 */
export function middleware (current) {
	var length = sizeof(current)

	return function (current, callback) {
		var output = ''
		var string = ''

		for (var i = 0; i < length; i++)
			if (string = current[i](current, callback))
				output += string

		return output
	}
}
