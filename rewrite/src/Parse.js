import {absof, charof, sizeof, hashof, tokenof} from './Utility.js'

/**
 * @param {object} that
 * @param {object} iterator
 * @param {Array<number>} position
 * @param {Array<string>} stack
 * @param {number} index
 * @param {number} atrule
 * @param {string} uuid
 * @param {*} state
 * @return {string}
 */
export function parse (that, iterator, points, stack, index, atrule, uuid, state) {
	var selector = stack[index]
	var current = stack
	var children = ''
	var sibling = ''
	var output = ''
	var value = ''

	var symbol = 0
	var dynamic = 0
	var breakpoint = 0
	var priority = 0
	var ampersand = 1

	var length = 0
	var caret = 0
	var size = 0

	var code = 0
	var prev = 0
	var next = 0

	outer:
		while (next = iterator.next())
			switch (prev = code, code = next) {
				// /
				case 47:
					switch (iterator.next()) {
						// *
						case 42:
							while (next = iterator.next())
								if (next === 42)
									if (iterator.peek() !== 42 && iterator.next() === 47)
										break

							break
						// /
						case 47:
							while (next = iterator.next())
								if (next === 10)
									break
							break
					}
					break
				// \t \n \s
				case 9: case 10: case 32:
					while (next = iterator.peek())
						if (next < 33)
							iterator.next()
						else
							break

					if (tokenof(prev) | tokenof(next))
						break

					value += ' '
					break
				// [ ]
				case 91: code++
				// ( )
				case 40: code++
				// " '
				case 34: case 39:
					caret = iterator.caret()

					while (next = iterator.next())
						if (next === code)
							break

					value += iterator.slice(caret - 1, iterator.caret())
					break
				// \f
				case 12:
					dynamic = sizeof(value) - 1
					break
				// }
				case 125:
					break outer
				// {
				case 123:
					points[length++] = sizeof(value) * ampersand
				// ;
				case 59:
					switch (code + symbol) {
						// ;
						case 59:
							children += (value = declare(that, value, breakpoint, priority, dynamic, uuid, state)) && value + ';'
							break
						// {
						case 123:
							stack[index + 1] = select(that, value, [''], points, selector, length, uuid, state)
							sibling += parse(that, iterator, points, stack, index + 1, atrule, uuid, state)
							break
						// @at-rule
						default:
							switch (current = stack, hashof(value, 0, size)) {
								// @media @supports @document
								case 95173: case 5913923: case 6165980:
									break
								// @keyframes @font-feature-values @page
								case 24388983: case 867972279: case 23529:
								// @at-rule...
								default:
									current = [['']]
							}

							sibling += value + '{' + parse(that, iterator, points, current, index, symbol, uuid, state) + '}'
					}

					value = '', ampersand = 1, symbol = dynamic = breakpoint = priority = length = 0
					break
				// ,
				case 44:
					points[length++] = sizeof(value) * ampersand
				default:
					switch (value += charof(code), code) {
						// @
						case 64:
							symbol = iterator.peek()

							while (!tokenof(iterator.peek()))
								value += charof(code = iterator.next())

							size = sizeof(value)
							break
						// :
						case 58:
							breakpoint = sizeof(value) - 1
							break
						// !
						case 33:
							priority = iterator.peek()
							break
						// ,
						case 44:
							ampersand = 1
							break
						// &
						case 38:
							ampersand = -1
							break
					}
			}

	if (children += value && declare(that, value, breakpoint, priority, uuid, state))
		if (value = selector.join(','))
			children = value + '{' + children + '}'

	return children + sibling
}

/**
 * @param {string} value
 * @param {number} breakpoint
 * @param {number} priority
 * @param {string} uuid
 * @param {*} state
 * @return {string}
 */
export function declare (that, value, breakpoint, priority, uuid, state) {
	return that.declaration(value, breakpoint, priority, uuid, state)
}

/**
 * @param {object} that
 * @param {string} value
 * @param {Array<string>} current
 * @param {Array<number>} points
 * @param {Array<string>} parents
 * @param {number} length
 * @param {string} uuid
 * @param {*} state
 * @return {Array<string>}
 */
export function select (that, value, current, points, parents, length, uuid, state) {
	// for each element in the list extract element
	for (var i = 0, j = 0, k = -1, x = 0, y = 0, z = value; i < length; ++i)
		// for each parent prepend to element, the sign bit on x indicates whether the selector contains "&"
		for (z = value.slice(k + 1, k = absof(x = points[i])), y = 0; y < parents.length; ++y)
			current[j++] = that.selector(z, parents[y], x, uuid, state).trim()

	return current
}

export function group () {
}
