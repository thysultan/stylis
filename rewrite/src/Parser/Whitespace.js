/**
 * @param {Object} read
 * @param {number} char
 * @return {number}
 */
export function whitespace (read, char) {
	var next = char

	while (next = read.peek(0))
		if (next > 32)
			break
		else
			read.next(char)

	return next
}
