import {DECLARATION, SELECTOR, ELEMENT, RULESET} from './Proxy.js'

/**
 * @param {string} value
 * @return {string}
 */
export function compile (value) {
	return this.parse([], 0, this.iterator(value))
}

/**
 * @param {Array<string>} stack
 * @param {number} size
 * @param {object} iterator
 * @return {string}
 */
export function parse (stack, size, iterator) {
	var declarations = []
	var selectors = []
	var rulesets = []
	var characters = ''
	var breakpoint = 0
	var priority = 0
	var atrule = 0
	var index = 0
	var char = 0
	var prev = 0
	var next = 0

	outer:
		while (next = iterator.next())
			switch (prev = char, char = next) {
				// /
				case 47:
					switch (iterator.next()) {
						// *
						case 42:
							while (next = iterator.next())
								if (next === 42 && iterator.next() === 47)
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

					if (token(prev) | token(next))
						break

					characters += ' '
					break
				// [ ]
				case 91: char++
				// ( )
				case 40: char++
				// " '
				case 34: case 39:
					index = iterator.caret

					while (next = iterator.next())
						if (next === char)
							break

					characters += iterator.value.substring(index-1, iterator.caret)
					break
				// ; , {
				case 59: case 44: case 123:
					switch (priority = atrule = 0, char) {
						// ;
						case 59:
							this.proxy(DECLARATION, characters, declarations, iterator, breakpoint, priority)
							break
						// ,
						case 44:
							this.proxy(ELEMENT, characters, selectors, iterator, breakpoint, priority)
							break
						// {
						case 123:
							this.proxy(ELEMENT, characters, selectors, iterator, breakpoint, priority)
							this.proxy(SELECTOR, selectors, stack, iterator, size, priority)
							this.proxy(RULESET, this.parse(stack, size+1, iterator), rulesets, iterator, breakpoint, priority)
							break
					}
					characters = ''
					break
				// }
				case 125:
					break outer
				default:
					switch (characters += iterator.read(char), char) {
						// :
						case 58:
							breakpoint = characters.length-1
							break
						// !
						case 33:
							priority = iterator.peek()
							break
						// @
						case 64:
							atrule = iterator.peek()
							break
					}
			}

	if (characters.length)
		this.proxy(DECLARATION, characters, declarations, iterator, breakpoint, priority)

	return this.stringify(stack.length ? stack.pop() : [], declarations, rulesets)
}

/**
 * @param {number} char
 * @return {boolean}
 */
function token (char) {
	switch (char) {
		// \0 \t \n \s
		case 0: case 9: case 10: case 32:
		// { } ; ,
		case 123: case 125: case 59: case 44:
		// [ ( " '
		case 91: case 40: case 34: case 39:
		// ! #
		case 33: case 35:
			return 1
		default:
			return 0
	}
}
