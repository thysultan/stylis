import {RULESET, DECLARATION, COMMENT} from './Enum.js'
import {abs, trim, from, push, sizeof, strlen, substr, replace} from './Utility.js'
import {node, next, peek, caret, slice, alloc, dealloc, delimiter, whitespace, identifier} from './Tokenizer.js'

/**
 * @param {string} value
 * @return {string[]}
 */
export function compile (value) {
	return dealloc(parse('', [alloc(value)], [], [''], []))
}

/**
 * @param {string} value
 * @param {number[]} points
 * @param {string[]} declarations
 * @param {string[]} rules
 * @param {string[]} rulesets
 * @return {object}
 */
export function parse (value, points, declarations, rules, rulesets) {
	var index = 0
	var offset = 0
	var length = 0
	var scanning = 1
	var previous = 0
	var character = 0
	var ampersand = 1
	var type = ''
	var props = rules
	var children = rulesets
	var temporary = type

	while (scanning)
		switch (previous = character, character = next()) {
			// [ ]
			case 91: ++character
			// ( )
			case 40: ++character
			// " '
			case 34: case 39:
				temporary += delimiter(character)
				break
			// \t \n \s
			case 9: case 10: case 32:
				temporary += whitespace(previous)
				break
			// /
			case 47:
				push(rulesets, comment(next()))
				break
			// {
			case 123:
				points[index++] = strlen(temporary) * ampersand
			// } ; \0
			case 125: case 59: case 0:
				switch (character) {
					// \0 }
					case 0: case 125: --scanning
					// ;
					case 59 + offset:
						if (length > 0)
							push(declarations, declaration(temporary, length))
						break
					// rule/atrule
					default:
						push(rulesets, ruleset(temporary, points, index, offset, rules, type, props = [], children = []))

						if (character !== 59)
							if (offset === 0)
								parse(temporary, points, children, props, rulesets)
							else if (parse(value, points, props = [], rules, children), sizeof(props))
								push(children, ruleset(value, points, 0, 0, rules, type, rules, props))
				}

				index = length = offset = 0, ampersand = 1, type = temporary = ''
				break
			default:
				switch (temporary += from(character), character) {
					// &
					case 38:
						ampersand = offset > 0 ? 1 : -1
						break
					// :
					case 58:
						length = strlen(temporary) - 1
						break
					// @
					case 64:
						offset = strlen(type = temporary += identifier(caret())), character++
						break
					// ,
					case 44:
						points[index++] = (strlen(temporary) - 1) * ampersand, ampersand = 1
						break
				}
		}

	return rulesets
}

/**
 * @param {number} type
 * @return {object}
 */
export function comment (type) {
	var index = caret() - 2
	var offset = type === 42 ? 2 : 1
	var temporary = trim(from(peek(0))) || from(type)
	var character = 0

	while (character = next())
		if (character === 10 && type === 47)
			break
		else if (character === 42 && type === 42 && peek(0) !== 42 && next() === 47)
			break

	return node(temporary, COMMENT, temporary, substr(temporary = slice(index, caret()), 2, strlen(temporary) - offset))
}

/**
 * @param {string} value
 * @param {number[]} points
 * @param {number} index
 * @param {number} offset
 * @param {string[]} rules
 * @param {string} type
 * @param {string[]} props
 * @param {string[]} children
 * @return {object}
 */
export function ruleset (value, points, index, offset, rules, type, props, children) {
	var post = offset - 1
	var root = offset === 0 ? rules : ['']
	var size = sizeof(root)

	for (var i = 0, j = 0, k = 0; i < index; ++i)
		for (var x = 0, y = substr(value, post + 1, post = abs(j = points[i])), z = value; x < size; ++x)
			if (z = trim(j > 0 ? root[x] + ' ' + y : replace(y, /&/g, root[x])))
				props[k++] = z

	return node(value, offset === 0 ? RULESET : type, props, children)
}

/**
 * @param {string} value
 * @param {number} length
 * @return {object}
 */
export function declaration (value, length) {
	return node(value, DECLARATION, substr(value, 0, length), substr(value, length + 1, strlen(value)))
}
