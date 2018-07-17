/**
 * @param {string} value
 * @param {Array<string>} stack
 * @param {number} breakpoint
 * @param {number} priority
 * @return {Array}
 */
export function selector (value, stack, breakpoint, priority) {
	// TODO
	if (breakpoint > 0)
		return stack[breakpoint-1].map((str) => str + ' ' + value.join(','))
	else
		return value
}
