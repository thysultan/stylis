import {KEYFRAMES, DECLARATION} from './Enum.js'
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
