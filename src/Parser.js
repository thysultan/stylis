import {COMMENT, RULESET, DECLARATION} from './Enum.js'
import {abs, trim, from, sizeof, strlen, substr, append, prepend, replace} from './Utility.js'
import {node, scan, peek, caret, slice, alloc, dealloc, token, attoken, delimiter, whitespace, identifier} from './Tokenizer.js'

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
	var atrule = 0
	var variable = 1
	var ampersand = 1
	var type = ''
	var props = rules
	var children = rulesets
	var temporary = type

	while (scanning)
		switch (previous = character, character = scan()) {
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
				token(peek(0)) > 2 ? append(comment(scan()), rulesets) : temporary += from(47)
				break
			// {
			case 123 * variable:
				points[index++] = strlen(temporary) * ampersand
			// } ; \0
			case 125 * variable: case 59: case 0:
				switch (character) {
					// \0 }
					case 0: case 125: --scanning
					// ;
					case 59 + offset:
						if (length > 0)
							append(declaration(temporary, length), declarations)
						break
					// rule/at-rule
					default:
						append(ruleset(temporary, points, index, offset, rules, type, props = [], children = []), rulesets)

						if (character !== 59)
							if (offset === 0)
								parse(temporary, points, children, props, rulesets)
							else if (attoken(atrule))
								parse(temporary, points, children, [''], children)
							else if (parse(value, points, props = [], rules, children), sizeof(props))
								prepend(ruleset(value, points, 0, 0, rules, type, rules, props), children)
				}

				index = length = offset = 0, variable = ampersand = 1, type = temporary = ''
				break
			// -
			case 45:
				if (previous === 45)
					variable = 0
			// :
			case 58:
				length = strlen(temporary)
			default:
				switch (temporary += from(character), character * variable) {
					// &
					case 38:
						ampersand = offset > 0 ? 1 : -1, temporary += from(12)
						break
					// @
					case 64:
						atrule = peek(0), offset = strlen(type = temporary += identifier(caret())), character++
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

	while (character = scan())
		if (character === 10 && type === 47)
			break
		else if (character === 42 && type === 42 && peek(0) !== 42 && scan() === 47)
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
			if (z = trim(j > 0 ? root[x] + ' ' + y : replace(y, /&\f/g, root[x])))
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
