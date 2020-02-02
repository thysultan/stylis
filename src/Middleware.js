import {KEYFRAMES, DECLARATION, COMMENT} from './Enum.js'
import {sizeof, strlen} from './Utility.js'
import {stringify} from './Serializer.js'
import {prefix} from './Prefixer.js'

/**
 * @param {object} element
 * @param {function} callback
 * @return {string}
 */
export function prefixer (element, callback) {
	switch (element.type) {
		case DECLARATION: return prefix(element.value, strlen(element.props))
		case KEYFRAMES: return prefix(stringify(element, callback), 10)
	}

	return ''
}

/**
 * @param {function} insert
 * @return {string}
 */
export function rulesheet (insert) {
	let inserting = 0

	return function (element, callback) {
		if (inserting || !sizeof(element.children)) {
			return ''
		}

		switch (element.type) {
			case DECLARATION:
			case COMMENT:
				return ''
		}

		inserting = 1
		const rule = callback(element, callback)
		insert(rule)
		inserting = 0

		return ''
	}
}

/**
 * @param {function[]} collection
 * @return {function}
 */
export function middleware (collection) {
	var length = sizeof(collection)

	return function (element, callback) {
		var output = ''
		var string = ''

		for (var i = 0; i < length; i++)
			if (string = collection[i](element, callback))
				output += string

		return output
	}
}
