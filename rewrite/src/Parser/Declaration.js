import {DECLARATION} from '../Constant.js'
import {strlen, substr, push, node} from '../Utility.js'

/**
 * @param {Array<string>} stack
 * @param {string} value
 * @param {number} length
 * @param {Object} source
 */
export function declaration (stack, value, length, source) {
	push(stack, node(DECLARATION, substr(value, 0, length), substr(value, length + 1, strlen(value)), value, source))
}
