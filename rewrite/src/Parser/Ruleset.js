import {str, strlen, sizeof, src, next} from '../Utility.js'
import {rule} from './Rule.js'
import {declaration} from './Declaration.js'
import {comment} from './Comment.js'
import {identifier} from './Identifier.js'
import {whitespace} from './Whitespace.js'
import {delimiter} from './Delimiter.js'

/**
 * @param {Object} read
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @param {Array<string>} targets
 * @param {string} at
 * @param {Array<string>} rules
 * @param {Array<string>} declarations
 * @param {Array<string>} atrules
 * @return {Array<string>}
 */
export function ruleset (read, points, styles, targets, at, rules, declarations, atrules) {
	var code = 1
	var char = 0
	var prev = 0
	var index = 0
	var length = 0
	var offset = 0
	var value = ''
	var type = value
	var props = rules
	var children = targets

	while (code)
		switch (prev = char, char = next(read, code)) {
			// /
			case 47:
				comment(read, children, next(read, char))
				break
			// [ ]
			case 91:
				++char
			// ( )
			case 40:
				++char
			// " '
			case 34: case 39:
				value += delimiter(read, char)
				break
			// \t \n \s
			case 9: case 10: case 32:
				value += whitespace(read, prev)
				break
			// {
			case 123:
				points[index++] = strlen(value)
			// } ;
			case 125: case 59: case 0:
				switch (char) {
					// eof
					case 125: case 0:
						--code
					// decl
					case 59 + offset:
						if (length)
							declaration(read, declarations, value, length)
						// if (code || !at || !sizeof(declarations)) {
						// }
						break
					// rule/atrule
					default:
						rule(read, targets, value, points, index, offset, offset ? atrules : rules, type, props = [], children = [])

						if (char == 59)
							break

						ruleset(read, points, styles, offset ? children : targets, type, offset ? rules : props, children, !offset ? atrules : props)
				}

				index = length = offset = 0, type = value = ''
				break
			default:
				switch (value += str(char), char) {
					// ,
					case 44:
						points[index++] = strlen(value) - 1
						break
					// :
					case 58:
						length = strlen(value) - 1
						break
					// @
					case 64:
						offset = strlen(type = value += identifier(read, char++))
						break
				}
		}

	return styles
}
