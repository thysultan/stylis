var COMMENT = 'comm';
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
	return {'type': type, 'props': props, 'children': children, 'value': value, 'source': source}
}

/**
 * @return {Object}
 */
function src (read) {
	return {'line': read.line, 'column': read.column, 'caret': read.caret}
}

/**
 * @param {string} value
 * @return {Object}
 */
function iterator (value) {
	return {"value": value, "line": 1, "column": 1, caret: 0}
}

/**
 * @param {Object} read
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function slice (read, begin, end) {
	return substr(read.value, begin, end)
}

/**
 * @param {Object} read
 * @param {number} code
 * @return {number}
 */
function next (read, code) {
	var char = charat(read.value, read.caret++);

	if (read.column++, char === 10)
		read.column = 1, read.line++;

	return char
}

/**
 * @param {Object} read
 * @param {number} distance
 * @return {number}
 */
function peek (read, distance) {
	return charat(read.value, read.caret + distance)
}

/**
 * @param {Object} read
 * @return {number}
 */
function caret (read) {
	return read.caret
}

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
function rule (read, stack, value, points, length, offset, parents, type, props, children) {
	for (var i = 0, j = offset - 1, k = '', l = sizeof(parents), m = 0; i < length; ++i)
		for (k = substr(value, j + 1, j = points[i]), m = 0; m < l; ++m)
			if (k = trim(parents[m] + ' ' + k))
				push(props, k);

	return push(stack, node(offset ? type : RULE, props, children, value, src(read)))
}

/**
 * @param {Object} read
 * @param {Array<string>} stack
 * @param {string} value
 * @param {number} length
 * @return {number}
 */
function declaration (read, stack, value, length) {
	return push(stack, node(DECLARATION, substr(value, 0, length), substr(value, length + 1, strlen(value)), value, src(read)))
}

/**
 * @param {Object} read
 * @param {Array<string>} stack
 * @param {number} type
 */
function comment (read, stack, type) {
	var char = 0;
	var index = caret(read) - 2;
	var value = trim(str(peek(read, 0))) || str(type);
	var offset = type === 42 ? 2 : 1;

	while (char = next(read, type))
		if (type == 47 && char == 10)
			break
		else if (type == 42 && char == 42 && peek(read, 0) != 42 && next(read, type) == 47)
			break

	push(stack, node(COMMENT, value, substr(value = slice(read, index, caret(read)), 2, strlen(value) - offset), value, src(read)));
}

/**
 * @param {Object} read
 * @param {number} type
 * @return {string}
 */
function identifier (read, type) {
	var index = caret(read);

	while (!token(peek(read, 0)))
		next(read, type);

	return slice(read, index, caret(read))
}

/**
 * @param {Object} read
 * @param {number} prev
 * @return {string}
 */
function whitespace (read, prev) {
	var code = 0;

	while (code = peek(read, 0))
		if (code > 32) {
			break
		} else {
			next(read, 0);
		}

	return token(prev) > 0 || token(code) > 0 ? '' : ' '
}

/**
 * @param {Object} read
 * @param {number} type
 * @return {string}
 */
function delimiter (read, type) {
	return trim(slice(read, caret(read) - 1, delimit(read, type)))
}

/**
 * @param {Object} read
 * @param {number} type
 * @return {number}
 */
function delimit (read, type) {
	var char = 0;

	while (char = next(read, type))
		if (char == type)
			break
		else if (char == 34 || char == 39)
			delimit(read, char);

	return caret(read)
}

/**
 * @param {Object} read
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @param {Array<string>} targets
 * @param {string} at
 * @param {Array<string>} rules
 * @param {Array<string>} declarations
 * @param {Array<string>} atrules
 * @return {Array<string>}
 */
function ruleset (read, points, styles, targets, at, rules, declarations, atrules) {
	var code = 1;
	var char = 0;
	var prev = 0;
	var index = 0;
	var length = 0;
	var offset = 0;
	var value = '';
	var type = value;
	var props = rules;
	var children = targets;

	while (code)
		switch (prev = char, char = next(read, code)) {
			// /
			case 47:
				comment(read, children, next(read, char));
				break
			// [ ]
			case 91:
				++char;
			// ( )
			case 40:
				++char;
			// " '
			case 34: case 39:
				value += delimiter(read, char);
				break
			// \t \n \s
			case 9: case 10: case 32:
				value += whitespace(read, prev);
				break
			// {
			case 123:
				points[index++] = strlen(value);
			// } ;
			case 125: case 59: case 0:
				switch (char) {
					// eof
					case 125: case 0:
						--code;
					// decl
					case 59 + offset:
						if (length)
							declaration(read, declarations, value, length);
						// if (code || !at || !sizeof(declarations)) {
						// }
						break
					// rule/atrule
					default:
						rule(read, targets, value, points, index, offset, offset ? atrules : rules, type, props = [], children = []);

						if (char == 59)
							break

						ruleset(read, points, styles, offset ? children : targets, type, offset ? rules : props, children, !offset ? atrules : props);
				}

				index = length = offset = 0, type = value = '';
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
						offset = strlen(type = value += identifier(read, char++));
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
	return parse(value, [0], [])
}

/**
 * @param {string} value
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @return {Array<string>}
 */
function parse (value, points, styles) {
	return ruleset(iterator(value), points, styles, styles, '', [''], [], [''])
}

export default compile;
