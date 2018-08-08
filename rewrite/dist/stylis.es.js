var COMMENT = 'comment';
var DECLARATION = 'decl';
var RULE = 'rule';

var str = String.fromCharCode;

/**
 * @param {number} code
 * @return {number}
 */
function token (code) {
	switch (code) {
		// \0 \t \s \n
		case 0: case 9: case 32: case 10:
		// @ > + * ~ : , ! /
		case 64: case 62: case 43: case 42: case 126: case 58: case 44: case 33: case 47:
		// { } ; " '
		case 123: case 125: case 59: case 34: case 39:
			return 2
		// [ (
		case 91: case 40:
			return 1
	}

	return 0
}

/**
 * @param {string} str
 * @return {string}
 */
function trim (str) {
	return str.trim()
}

/**
 * @param {string} str
 * @param {number} i
 * @return {number}
 */
function charat (str, i) {
	return str.charCodeAt(i)|0
}

/**
 * @param {string} str
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function substr (str, begin, end) {
	return str.slice(begin, end)
}

/**
 * @param {string} str
 * @return {number}
 */
function strlen (str) {
	return str.length
}

/**
 * @param {Array<*>} arr
 * @return {number}
 */
function sizeof (arr) {
	return arr.length
}

/**
 * @param {Array<*>} arr
 * @param {*} value
 * @return {number}
 */
function push (arr, value) {
	return arr.push(value)
}

/**
 * @param {*} type
 * @param {*} props
 * @param {*} children
 * @param {string} value
 * @param {*} source
 */
function node (type, props, children, value, source) {
	return {type: type, props: props, children: children, value: value, source: source}
}

/**
 * @return {Object}
 */
function src (read) {
	return {line: read.line, column: read.column, caret: read.caret}
}

/**
 * @param {string} value
 * @return {Object}
 */
function iterator (value) {
	return {value: value, slice: slice, next: next, peek: peek, line: 1, column: 1, caret: 0}
}

/**
 * @this {Object}
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function slice (begin, end) {
	return substr(this.value, begin, end)
}

/**
 * @this {Object}
 * @param {number} code
 * @return {number}
 */
function next (code) {
	var char = charat(this.value, this.caret++);

	if (this.column++, char === 10)
		this.column = 1, this.line++;

	return char
}

/**
 * @this {Object}
 * @param {number} distance
 * @return {number}
 */
function peek (distance) {
	return charat(this.value, this.caret + distance)
}

/**
 * @param {Array<string>} stack
 * @param {string} value
 * @param {Array<number>} points
 * @param {number} length
 * @param {number} offset
 * @param {Array<string>} parents
 * @param {string} type
 * @param {Array<string>} props
 * @param {Array<string>} children
 * @param {Object} source
 */
function rule (stack, value, points, length, offset, parents, type, props, children, source) {
	for (var i = 0, j = offset - 1, k = '', l = sizeof(parents), m = 0; i < length; ++i)
		for (k = substr(value, j + 1, j = points[i]), m = 0; m < l; ++m)
			if (k = trim(parents[m] + ' ' + k))
				push(props, k);

	push(stack, node(type || RULE, props, children, value, source));
}

/**
 * @param {Array<string>} stack
 * @param {string} value
 * @param {number} length
 * @param {Object} source
 */
function declaration (stack, value, length, source) {
	push(stack, node(DECLARATION, substr(value, 0, length), substr(value, length + 1, strlen(value)), value, source));
}

/**
 * @param {Object} read
 * @param {Array<string>} stack
 * @param {number} char
 * @param {Object} source
 */
function comment (read, stack, char, source) {
	var caret = read.caret - 2;
	var value = trim(str(read.peek(0)));
	var type = value || str(char);
	var offset = char === 42 ? 2 : 1;
	var next = char;

	while (next = read.next(char))
		// //
		if (char == 47 && next == 10)
			break
		// /*
		else if (char == 42 && next == 42 && read.peek(0) != 42 && read.next(char) == 47)
			break

	push(stack, node(COMMENT, type, substr(value = read.slice(caret, read.caret), 2, strlen(value) - offset), value, source));
}

/**
 * @param {Object} read
 * @param {number} char
 * @return {number}
 */
function identifier (read, char) {
	while (!token(read.peek(0)))
		read.next(char);

	return read.caret
}

/**
 * @param {Object} read
 * @param {number} char
 * @return {number}
 */
function recurrance (read, char) {
	var next = char;

	while (next = read.next(char))
		// ] )
		if (next == char)
			break
		// " '
		else if (next == 34 || next == 39)
			recurrance(read, next);

	return read.caret
}

/**
 * @param {Object} read
 * @param {number} char
 * @return {number}
 */
function whitespace (read, char) {
	var next = char;

	while (next = read.peek(0))
		if (next > 32)
			break
		else
			read.next(char);

	return next
}

/**
 * @param {Object} read
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @param {Array<string>} parents
 * @param {string} at
 * @param {Array<string>} decl
 * @param {Array<string>} target
 * @return {Array<string>}
 */
function ruleset (read, points, styles, parents, at, decl, target) {
	var char = 0;
	var prev = 0;
	var next = 0;

	var code = 1;
	var index = 0;
	var length = 0;
	var offset = 0;

	var value = '';
	var type = value;
	var props = parents;
	var children = target;

	// while ((next = read.next(code)) * code)
		// switch (prev = char, char = next) {
	while (next = read.next(code), code)
		switch (prev = char, char = next) {
			// /
			case 47:
				comment(read, children, read.next(char), src(read));
				break
			// [ ]
			case 91:
				char++;
			// ( )
			case 40:
				char++;
			// " '
			case 34: case 39:
				value += trim(read.slice(read.caret - 1, recurrance(read, char)));
				break
			// \t \n \s
			case 9: case 10: case 32:
				value += token(prev) > 0 || token(whitespace(read, char)) > 0 ? '' : ' ';
				break
			// {
			case 123:
				points[index++] = strlen(value);
			// ; }
			case 59: case 125: case 0:
				switch (char -= offset) {
					// }
					case 125:
						code = 0;
					// ;
					case 59:
						if (length)
							declaration(decl, value, length, src(read));
						break
					case 0:
						code = 0;
						break
					// {
					default:
						rule(target, value, points, index, offset, offset ? [''] : parents, type, props = [], children = [], src(read));

						if (char != 52)
							ruleset(read, points, styles, props, type, children, offset ? children : styles);
						break
				}
				index = length = offset = 0, value = type = '';
				break
			default:
				switch (value += str(char), char) {
					// ,
					case 44:
						points[index++] = strlen(value) - 1;
						break
					// :
					case 58:
						length = strlen(value) - 1;
						break
					// @
					case 64:
						offset = strlen(type = value += read.slice(read.caret, identifier(read, char++)));
						break
				}
		}

	return styles
}

/**
 * @param {string} value
 * @return {Object}
 */
function compile (value) {
	return parse(iterator(value), [0], [], [''])
}

/**
 * @param {Object} read
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @param {Array<string>} parents
 * @return {Array<string>}
 */
function parse (read, points, styles, parents) {
	return ruleset(read, points, styles, parents, RULE, [], styles)
}

export default compile;
