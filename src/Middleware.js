import {MS, MOZ, WEBKIT, RULESET, KEYFRAMES, DECLARATION} from './Enum.js'
import {match, charat, substr, strlen, sizeof, replace, combine} from './Utility.js'
import {copy, tokenize} from './Tokenizer.js'
import {serialize} from './Serializer.js'
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
	if (!element.return)
		switch (element.type) {
			case DECLARATION: element.return = prefix(element.value, element.length)
				break
			case KEYFRAMES:
				return serialize([copy(replace(element.value, '@', '@' + WEBKIT), element, '')], callback)
			case RULESET:
				if (element.length)
					return combine(element.props, function (value) {
						switch (match(value, /(::place.+|:read-.+)/)) {
							// :read-(only|write)
							case ':read-only': case ':read-write':
								return serialize([copy(replace(value, /(read.+)/, MOZ + '$1'), element, '')], callback)
							// :placeholder
							case '::placeholder':
								return serialize([
									copy(replace(value, /(plac.+)/, WEBKIT + 'input-$1'), element, ''),
									copy(replace(value, /(plac.+)/, MOZ + '$1'), element, ''),
									copy(replace(value, /:(plac.+)/, MS + 'input-$1'), element, '')
								], callback)
						}

						return ''
					})
		}
}

/**
 * @param {object} element
 */
export function namespace (element) {
	switch (element.type) {
		case RULESET:
			element.props = element.props.map(function (value) {
				return combine(tokenize(value), function (value, index, children) {
					switch (charat(value, 0)) {
						// \f
						case 12:
							return substr(value, 1, strlen(value))
						// \0 ( + > ~
						case 0: case 40: case 43: case 62: case 126:
							return value
						// :
						case 58:
							if (children[index + 1] === 'global')
								children[index + 1] = '', children[index + 2] = '\f' + substr(children[index + 2], index = 1, -1)
						// \s
						case 32:
							return index === 1 ? '' : value
						default:
							switch (index) {
								case 0: element = value
									return sizeof(children) > 1 ? '' : value
								case index = sizeof(children) - 1: case 2:
									return index === 2 ? value + element + element : value + element
								default:
									return value
							}
					}
				})
			})
	}
}

/**
 * @param {object} element
 */
export function compat (element) {
	switch (element.type) {
		case RULESET:
			var i = 0
			var props = element.props
			var value = element.value
			var propsLength = props.length

			// short-circuit for the simplest case
			if (propsLength === 1 && charat(value, 0) !== 58 /* : */) {
				return
			}

			var valueTokens = tokenize(value)
			// keep delimiting indices between tokens of a particular group
			// include -1 and the length as well to allow for uniform calculations later
			var points = [-1]

			for (; i < valueTokens.length; i++) {
				if (valueTokens[i].charCodeAt(0) === 44 /* , */) {
					points.push(i)
				}
			}

			var groupsCount = points.length
			points.push(valueTokens.length)
			// props hold already computed "exploded" combinations
			// based on their length and groups count it's easy to get back a chunk length
			// over which we need to iterate through when processing a single group on "the current level"
			var parentGroupsCount = propsLength / groupsCount
			var propsCursor = 0

			for (i = 0; i < groupsCount; i++) {
				if (valueTokens[points[i] + 1].charCodeAt(0) !== 58 /* : */) {
					propsCursor += parentGroupsCount
					continue
				}

				var groupLength = points[i + 1] - points[i] - 1
				var cursorTarget = propsCursor + parentGroupsCount
				for (; propsCursor < cursorTarget; propsCursor++) {
					var prop = props[propsCursor]
					var propTokens = tokenize(prop)
					// adjust preceding token - we know it's a whitespace which we need to remove
					propTokens[propTokens.length - groupLength - 1] = ''
					props[propsCursor] = propTokens.join('')
				}
			}
	}
}
