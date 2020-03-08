import {RULESET, KEYFRAMES, DECLARATION} from './Enum.js'
import {test, charat, substr, strlen, sizeof, combine} from './Utility.js'
import {tokenize} from './Tokenizer.js'
import {stringify} from './Serializer.js'
import {prefix} from './Prefixer.js'

/**
 * @param {function[]} collection
 * @return {function}
 */
export function middleware (collection) {
	var length = sizeof(collection)

	return function (element, index, children, callback) {
		var output = ''

		for (var i = 0; i < length; i++)
			output += collection[i](element, index, children, callback) || ''

		return output
	}
}

/**
 * @param {function} callback
 * @return {function}
 */
export function rulesheet (callback) {
	return function (element) {
		if (!element.root)
			if (element = element.return)
				callback(element)
	}
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 */
export function prefixer (element, index, children, callback) {
	if (element.return === element.prefix)
		switch (element.type) {
			case DECLARATION: element.prefix = prefix(element.value, element.length)
				break
			case KEYFRAMES: element.prefix = prefix(stringify(element, index, element.prefix = null, callback), 10)
				break
			case RULESET:
				if (element.length)
					if (test(children = element.value, /:place|:read-/))
						element.prefix = prefix(stringify(element, index, element.prefix = null, callback), 0)
				break
		}
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 */
export function namespace (element) {
	switch (element.type) {
		case RULESET:
			element.props = element.props.map(function (value) {
				return combine(tokenize(value), function (value, index, children) {
					switch (charat(value, 0)) {
						// \f
						case 12: value = substr(value, 1, strlen(value))
						// \0 ( + > ~
						case 0: case 40: case 43: case 62: case 126:
							return value
						// :
						case 58:
							if (value === ':global')
								children[index + 1] = '\f' + substr(children[index + 1], index = 1, -1)
						// \s
						case 32:
							return index === 1 ? '' : value
						default:
							return index ? value + element : (element = value, sizeof(children) === 1 ? value : '')
					}
				})
			})
	}
}
