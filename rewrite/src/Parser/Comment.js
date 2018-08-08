import {COMMENT} from '../Constant.js'
import {str, strlen, substr, trim, node, push} from '../Utility.js'

/**
 * @param {Object} read
 * @param {Array<string>} stack
 * @param {number} char
 * @param {Object} source
 */
export function comment (read, stack, char, source) {
	var caret = read.caret - 2
	var value = trim(str(read.peek(0)))
	var type = value || str(char)
	var offset = char === 42 ? 2 : 1
	var next = char

	while (next = read.next(char))
		// //
		if (char == 47 && next == 10)
			break
		// /*
		else if (char == 42 && next == 42 && read.peek(0) != 42 && read.next(char) == 47)
			break

	push(stack, node(COMMENT, type, substr(value = read.slice(caret, read.caret), 2, strlen(value) - offset), value, source))
}
