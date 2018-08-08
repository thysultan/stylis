/**
 * @param {Object} read
 * @param {number} char
 * @return {number}
 */
export function recurrance (read, char) {
	var next = char

	while (next = read.next(char))
		// ] )
		if (next == char)
			break
		// " '
		else if (next == 34 || next == 39)
			recurrance(read, next)

	return read.caret
}
