export const DECLARATION = 0
export const SELECTOR = 1
export const ELEMENT = 2
export const RULESET = 3

/**
 * @param {number} type
 * @param {string} value
 * @param {Array<string>} stack
 * @param {object} iterator
 * @param {number} breakpoint
 * @param {number} priority
 */
export function proxy (type, value, stack, iterator, breakpoint, priority) {
	switch (type) {
		case DECLARATION:
			stack.push(this.declaration(value, breakpoint, priority))
			break
		case SELECTOR:
			stack.push(this.selector(value, stack, breakpoint, priority))
			break
		case ELEMENT:
			stack.push(value)
			break
		case RULESET:
			stack.push(value)
			break
	}
}
