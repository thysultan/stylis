/**
 * @param {Array<string>} stack
 * @param {number} size
 * @param {object} read
 * @return {string}
 */
export function parse (stack, size, read) {
	var declaration = []
	var selector = []
	var ruleset = []
	var characters = ''
	var breakpoint = 0
	var priority = 0
	var atrule = 0
	var index = 0
	var peek = 0
	var char = 0

	outer:
		while (char = read.next())
			switch (char) {
				// /
				case 47:
					switch (read.next()) {
						// *
						case 42:
							while (peek = read.next())
								if (peek === 42 && read.next() === 47)
									break
							break
						// /
						case 47:
							while (peek = read.next())
								if (peek === 10)
									break
							break
					}
					break
				// \s
				case 9: case 10: case 32:
					break
				// [ ]
				case 91: char++
				// ( )
				case 40: char++
				// " '
				case 34: case 39:
					while (peek = read.next())
						if (peek === char)
							break
					break
				case 59: case 44: case 123:
					switch (char) {
						// ;
						case 59:
							process(0, caret, characters, declaration, breakpoint, priority)
							break
						// ,
						case 44:
							process(1, caret, characters, selector, breakpoint, priority)
							break
						// {
						case 123:
							process(1, caret, characters, selector, breakpoint, priority)
							process(2, caret, selector, stack, size, priority)
							process(1, caret, parse(stack, size+1, read), ruleset, breakpoint, priority)
							break
					}
					characters = ''
					priority = 0
					atrule = 0
					break
				// }
				case 125:
					break outer
				default:
					switch (characters += read.char(char), char) {
						// :
						case 58:
							breakpoint = caret
							break
						// !
						case 33:
							priority = caret
							break
						case 64:
							atrule = caret
							break
					}
			}

	if (stack.length)
		selector = stack.pop()

	if (characters.length)
		process(0, caret, characters, declaration, breakpoint, priority)

	return stringify(selector, declaration, ruleset)
}
