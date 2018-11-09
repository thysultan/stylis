import {RULE} from '../Constant.js'
import {trim, substr, push, sizeof, node, src} from '../Utility.js'

/**
 * @param {Object} read
 * @param {Array<string>} stack
 * @param {string} value
 * @param {Array<number>} points
 * @param {number} length
 * @param {number} offset
 * @param {Array<string>} parents
 * @param {string} type
 * @param {Array<string>} props
 * @param {Array<string>} children
 * @return {number}
 */
export function rule (read, stack, value, points, length, offset, parents, type, props, children) {
	for (var i = 0, j = offset - 1, k = '', l = sizeof(parents), m = 0; i < length; ++i)
		for (k = substr(value, j + 1, j = points[i]), m = 0; m < l; ++m)
			if (k = trim(parents[m] + ' ' + k))
				push(props, k)

	return push(stack, node(offset ? type : RULE, props, children, value, src(read)))
}
