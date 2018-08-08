import {trim, token, str, strlen, substr, src, push, node} from '../Utility.js'
import {rule} from './Rule.js'
import {declaration} from './Declaration.js'
import {comment} from './Comment.js'
import {identifier} from './Identifier.js'
import {recurrance} from './Recurrance.js'
import {whitespace} from './Whitespace.js'

/**
 * @param {Object} read
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @param {Array<string>} parents
 * @param {string} at
 * @param {Array<string>} decl
 * @param {Array<string>} target
 * @return {Array<string>}
 */
export function ruleset (read, points, styles, parents, at, decl, target) {
	var char = 0
	var prev = 0
	var next = 0

	var code = 1
	var index = 0
	var length = 0
	var offset = 0

	var value = ''
	var type = value
	var props = parents
	var children = target

	// while ((next = read.next(code)) * code)
		// switch (prev = char, char = next) {
	while (next = read.next(code), code)
		switch (prev = char, char = next) {
			// /
			case 47:
				comment(read, children, read.next(char), src(read))
				break
			// [ ]
			case 91:
				char++
			// ( )
			case 40:
				char++
			// " '
			case 34: case 39:
				value += trim(read.slice(read.caret - 1, recurrance(read, char)))
				break
			// \t \n \s
			case 9: case 10: case 32:
				value += token(prev) > 0 || token(whitespace(read, char)) > 0 ? '' : ' '
				break
			// {
			case 123:
				points[index++] = strlen(value)
			// ; }
			case 59: case 125: case 0:
				switch (char -= offset) {
					// }
					case 125:
						code = 0
					// ;
					case 59:
						if (length)
							declaration(decl, value, length, src(read))
						break
					case 0:
						code = 0;
						break
					// {
					default:
						rule(target, value, points, index, offset, offset ? [''] : parents, type, props = [], children = [], src(read))

						if (char != 52)
							ruleset(read, points, styles, props, type, children, offset ? children : styles)
						break
				}
				index = length = offset = 0, value = type = ''
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
						offset = strlen(type = value += read.slice(read.caret, identifier(read, char++)))
						break
				}
		}

	return styles
}
