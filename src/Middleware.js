import {KEYFRAMES, DECLARATION} from './Enum.js'
import {strlen} from './Utility.js'
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

	return stringify(element, callback)
}

/**
 * @param {function} callback
 * @return {function}
 */
export function rulesheet (callback) {
	return function (element) {
		if (element = stringify(element, prefixer))
			callback(element)
	}
}

/**
 * @param {function} callback
 * @return {function}
 */
export function sourcemap (callback) {
	return function (element) {
		callback({line: element.line, column: element.column, caret: element.caret})
	}
}

// TODO
/**
 * @example element.props = cascade(element.props, '[id=uuid]')
 * @param {string[]} selector
 * @param {string} namespace
 * @return {string[]}
 */
export function cascade (selector, namespace) {
	selector.map(function (value) {
		// h1 h2 :matches(h1 h2) => h1[uuid] h2[uuid] [uuid]:matches(h1 h2)
		return dealloc(tokenize(alloc(value))).map(function (value, index, children) {
			switch (charat(value, 0)) {
				// :global
				case 'g':
					return value
				case '~': case '>': case '+': case '(':
					break
				default:
					return value + namespace
			}
		}).join(' ')
	})
}
