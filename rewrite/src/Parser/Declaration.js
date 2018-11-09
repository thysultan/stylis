import {DECLARATION} from '../Constant.js'
import {strlen, substr, push, node, src} from '../Utility.js'

/**
 * @param {Object} read
 * @param {Array<string>} stack
 * @param {string} value
 * @param {number} length
 * @return {number}
 */
export function declaration (read, stack, value, length) {
	return push(stack, node(DECLARATION, substr(value, 0, length), substr(value, length + 1, strlen(value)), value, src(read)))
}
