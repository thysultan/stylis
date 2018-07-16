/**
 * @param {number} type
 * @param {number} index
 * @param {string} value
 * @param {Array<string>} stack
 * @param {number} breakpoint
 * @param {number} priority
 */
export function process (type, index, value, stack, breakpoint, priority) {
	switch (type) {
		// property
		case 0:
			// TODO see next todo, same thing
			stack.push(property(value, breakpoint-(index-value.length), priority))
			break
		// selector, rulset
		case 1:
			stack.push(value)
			break
		// stack
		case 2:
			// TODO use instance.scope pattern so that this is couple to the default shipped implementation of the scoping mechanism
			stack.push(scope(value, stack, breakpoint, priority))
			break
		// ruleset
		case 3:
			stack.push(value)
			break
	}
}
