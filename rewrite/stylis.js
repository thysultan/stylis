/*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * light – weight css preprocessor @licence MIT
 */
/* eslint-disable */
(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module.exports = factory()) :
		typeof define === 'function' && define.amd ? define(factory()) :
			(window['stylis'] = factory())
}(function () {

	/**
	 * Notes
	 *
	 * int + int + int === n4 [faster]
	 *
	 * vs
	 *
	 * int === n1 && int === n2 && int === n3
	 *
	 * ----
	 *
	 * switch (int) { case ints...} [faster]
	 *
	 * vs
	 *
	 * if (int == 1 && int === 2 ...)
	 *
	 * ----
	 *
	 * The (first*n1 + second*n2 + third*n3) format used in the property parser
	 * is a simple way to hash the sequence of characters
	 * taking into account the index they occur in
	 * since any number of 3 character sequences could produce duplicates.
	 *
	 * On the other hand sequences that are directly tied to the index of the character
	 * resolve a far more accurate measure, it's also faster
	 * to evaluate one condition in a switch statement
	 * than three regardless of the added math
	 *
	 * This allows the property parser to be small and fast.
	 */

	var formatptn = /[\r\n]/g /* matches new lines */
	var colonptn = /: */g /* splits animation rules */
	var cursorptn = /zoo|gra/ /* assert cursor varient */
	var transformptn = / *(transform)/g /* vendor prefix transform, older webkit */
	var animationptn = /,+\s*(?![^(]*[)])/g /* splits multiple shorthand notation animations */
	var propertiesbtn = / +\s*(?![^(]*[)])/g
	var selectorptn = /,\n+/g /* splits selectors */
	var andptn = /&/g /* match & */
	var attributeptn = /\[.+\=['"`]?(.*)['"`]?\]/g /* matches attribute values [id=match] */
	var keyptn = /[ .#~+>]+|^\d/g /* removes invalid characters from key */
	var escapeptn = /:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g /* matches :global(.*) */
	var keyframeptn = /@(\w+)\s+(\S+)\s*/ /* matches @keyframes $1 */
	var placeptn = /::?(place)/g /* match ::placeholder varient */
	var minifybeforeptn = /[\r\n\t ]+(?=[{\];=:])/g /* rm \s before ] ; = : */
	var minifyafterptn = /([[}=:])[\r\n\t ]+/g /* rm \s after characters [ } = : */
	var minifytailptn = /(\{[^{]+?);(?=\})/g /* rm tail semi-colons ;} */

	/* vendors */
	var webkit = '-webkit-'
	var moz = '-moz-'
	var ms = '-ms-'

	/* common strings */
	var important = ' !important'
	var display = 'display:'
	var flex = 'flex'
	var box = 'box'
	var width = 'width:'

	/* character codes */
	var SEMICOLON = 59
	var CLOSEBRACES = 125
	var OPENBRACES = 123
	var OPENPARENTHESES = 40
	var CLOSEPARENTHESES = 41
	var OPENBRACKET = 91
	var CLOSEBRACKET = 93
	var NEWLINE = 10
	var CARRIAGE = 13
	var TAB = 9
	var AT = 64
	var SPACE = 32
	var AND = 38
	var HASH = 35
	var DOT = 46
	var DASH = 45
	var UNDERSCORE = 95
	var STAR = 42
	var COMMA = 44
	var COLON = 58
	var SINGLEQUOTE = 39
	var DOUBLEQUOTE = 34
	var FOWARDSLASH = 47
	var GREATERTHAN = 62
	var LESSTHAN = 60
	var PLUS = 43
	var TILDE = 126
	var NULL = 0

	/* selector codes */
	var ID = HASH
	var CLASS = DOT
	var ATTRIBUTE = OPENBRACKET
	var CHILD = GREATERTHAN
	var ADJACENT = PLUS
	var SIBLING = TILDE

	/* special identifiers */
	var KEYFRAME = 107 /* k */
	var MEDIA = 109 /* m */
	var SUPPORTS = 115 /* s */
	var IMPORT = 169 /* i */
	var CHARSET = 163 /* c */
	var ESCAPE = 103 /* g */
	var FONT = 102 /* f */
	var PLACEHOLDER = 112 /* p */

	var LINECOMMENT = FOWARDSLASH
	var BLOCKCOMMENT = STAR

	var brq = 0 /* brackets [] */
	var cmt = 0 /* comments /* // */
	var fnq = 0 /* functions () */
	var str = 0 /* strings '', "", `` */

	var column = 0 /* current column */
	var line = 0 /* current line numebr */
	var pattern = 0 /* :pattern */

	var cascade = 1 /* #id h1 h2 vs h1#id h2#id  */
	var vendor = 1 /* vendor prefix */
	var escape = 1 /* escape :global pattern */
	var compress = 0 /* compress output */

	/* empty reference objects */
	var array = []

	/* plugins */
	var plugins = []
	var plugged = 0

	/* plugin context */
	var PREPS = 0
	var PROPS = 0
	var BLOCK = 0
	var POSTS = 0

	var preps = 0
	var props = 0
	var blcks = 0
	var posts = 0

	/* keyframe animation */
	var keyed = 1
	var key = ''

	/* selector namespace */
	var ns = ''

	/**
	 * Compile
	 *
	 * @param  {Array<string>} parent
	 * @param  {Array<string>} current
	 * @param  {string} body
	 * @return {string}
	 */
	function compile (parent, current, body) {
		var first = 0
		var second = 0
		var third = 0
		var length = 0
		var counter = 0
		var context = 0

		var pseudo = 0
		var caret = 0
		var code = 0
		var tail = 0
		var format = 0
		var semicolon = 0
		var eof = body.length
		var eol = eof - 1

		var char = ''
		var chars = ''
		var out = ''
		var block = ''
		var children = ''

		// ...build body
		while (caret < eof) {
			code = body.charCodeAt(caret)

			if (cmt + str + fnq + brq === 0) {
				// auto semicolon insertion
				if (semicolon === 1) {
					// false flags if current character is a comma
					if (code !== COMMA) {
						caret--
						code = SEMICOLON
					}

					semicolon = 0
				}

				// eof varient
				switch (caret) {
					case eol: {
						if ((chars = chars.trim()).length > 0) {
							switch (code) {
								case SPACE:
								case TAB:
								case CARRIAGE:
								case SEMICOLON:
								case NEWLINE: {
									break
								}
								default: {
									chars += body.charAt(caret)
								}
							}
							code = SEMICOLON
						}
					}
				}

				// token varient
				switch (code) {
					case OPENBRACES: {
						chars = chars.trim()
						counter = 1
						caret++

						while (caret < eof) {
							code = body.charCodeAt(caret)

							switch (code) {
								case OPENBRACES: counter++; break
								case CLOSEBRACES: counter--; break
							}

							if (counter === 0) {
								break
							}

							block += body.charAt(caret++)
						}

						if (chars.charCodeAt(0) === AT) {
							switch (chars.charCodeAt(1)) {
								case MEDIA:
								case SUPPORTS: {
									block = chars + '{' + compile(current, current, block) + '}'
									break
								}
								case FONT: {
									block = chars + compile(current, array, block)
									break
								}
								case KEYFRAME: {
									chars = chars.replace(keyframeptn, '$1 $2' + (keyed > 0 ? key : ''))
									block = chars + '{' + compile(current, array, block) + '}'
									block = '@' + (vendor > 0 ? webkit + block + '@' + block : block)
									break
								}
							}
						} else {
							block = compile(current, selector(current, chars), block)
						}

						children += block
						caret++

						// reset
						context = 0
						pseudo = 0
						chars = ''

						block = chars
						prefix = chars
						suffix = chars

						break
					}
					case SEMICOLON: {
						chars = chars.trim()
						first = chars.charCodeAt(0)
						second = chars.charCodeAt(1)
						third = chars.charCodeAt(2)

						switch (first + second) {
							case IMPORT:
							case CHARSET: {
								children += chars + body.charAt(caret)
								break
							}
							default: {
								out += property(chars, first, second, third, format)
							}
						}

						caret++

						// reset
						context = 0
						pseudo = 0
						chars = ''

						break
					}
				}
			}

			// parse characters
			switch (code) {
				case NEWLINE:
				case CARRIAGE: {
					// terminate line comment
					if (cmt === LINECOMMENT) {
						cmt = 0
					}

					// auto insert semicolon
					if (cmt + str + fnq + brq === 0) {
						// ruling out valid characters that
						// may precede a newline
						switch (tail) {
							case COMMA:
							case NULL:
							case TAB:
							case CARRIAGE:
							case NEWLINE:
							case SPACE:
							case SEMICOLON:
							case OPENBRACES:
							case CLOSEBRACES: {
								break
							}
							default: {
								// colon : present
								if (pseudo > 1) {
									semicolon = 1
								}
							}
						}
					}

					// next line, reset column position
					column = 0
					line++

					break
				}
				default: {
					// increment column position
					column++

					// ignore tabs
					if (code === TAB) {
						break
					}

					char = body.charAt(caret)

					// remove comments, escade functions, strings, attributes and prepare selectors
					switch (code) {
						// :global
						// :placeholder
						case PLACEHOLDER:
						case ESCAPE: {
							if (str + cmt + brq === 0 && pseudo > 0 && caret - pseudo === 1) {
								pattern = code
							}
							break
						}

						// :pattern
						case COLON: {
							if (str + cmt + brq === 0) {
								pseudo = caret
							}
							break
						}

						// selectors
						case COMMA: {
							if (cmt + fnq + str + brq === 0) {
								format = 1, char += '\n'
							}
							break
						}

						// qoutes
						case DOUBLEQUOTE: {
							if (cmt === 0) {
								str = str === DOUBLEQUOTE ? 0 : (str === 0 ? DOUBLEQUOTE : str)
							}
							break
						}
						case SINGLEQUOTE: {
							if (cmt === 0) {
								str = str === SINGLEQUOTE ? 0 : (str === 0 ? SINGLEQUOTE : str)
							}
							break
						}

						// attributes
						case OPENBRACKET: {
							if (str + cmt + fnq === 0) {
								brq = 1
							}
							break
						}
						case CLOSEBRACKET: {
							if (str + cmt + fnq === 0) {
								brq = 0
							}
							break
						}

						// functions
						case CLOSEPARENTHESES: {
							if (str + cmt + brq === 0) {
								fnq = 0
							}
							break
						}
						case OPENPARENTHESES: {
							if (str + cmt + brq === 0) {
								fnq = pseudo - (caret-6) === 0 ? (counter = 0, context = 1) : 1
							}
							break
						}

						// line comments
						case FOWARDSLASH: {
							if (cmt === BLOCKCOMMENT) {
								break
							}
						}

						// block comments
						case STAR: {
							// break if in line comment or escape sequence
							if (str + brq + fnq !== 0 || cmt === LINECOMMENT) {
								break
							}

							char = ''

							switch (body.charCodeAt(caret+1)) {
								case FOWARDSLASH: {
									cmt = code === FOWARDSLASH ? LINECOMMENT : 0; break
								}
								case STAR: {
									cmt = code === FOWARDSLASH ? BLOCKCOMMENT : cmt; break
								}
							}

							break
						}
					}

					// ignore comment blocks
					if (cmt === 0) {
						// aggressive isolation mode, divide each individual selector
						// including selectors in :not function but excluding selectors in :global function
						if (cascade + str + brq === 0) {
							switch ((format = 1, code)) {
								case ID:
								case CLASS:
								case SIBLING:
								case CHILD:
								case ADJACENT:
								case CLOSEPARENTHESES:
								case OPENPARENTHESES: {
									if (context === 0) {
										char = tail === SPACE ? char + '\r' : '\r' + char + '\r';
									} else {
										switch (code) {
											case LPAREN: context = ++counter; break
											case RPAREN: if ((context = --counter) === 0) char += '\r'; break
										}
									}
									break
								}
								case SPACE: {
									if (context === 0 && tail !== SPACE) {
										char += '\r';
									}
									break
								}
							}
						}

						chars += char
					}

					tail = code
				}
			}

			caret++
		}

		if (out.length > 0) {
			if (cascade > 0) {

			}

			out = current.join(',').trim() + '{' + out + '}'

			switch (pattern) {
				case 0: {
					break
				}
				case PLACEHOLDER: {
					// :placeholder
					out = (out.replace(placeptn, '::' + webkit + 'input-$1') +
						out.replace(placeptn, '::' + moz + '$1') +
						out.replace(placeptn, ':' + ms + 'input-$1') + out)
				}
				default: {
					pattern = 0
				}
			}
		}

		if (children.length > 0) {
			return out + children
		}

		return out
	}

	/**
	 * Selector
	 *
	 * @param {Array<string>} parent
	 * @param {string} current
	 * @return {Array<string>}
	 */
	function selector (parent, current) {
		var selectors = current.trim().split(selectorptn)
		var out = selectors

		var item = ''
		var child = ''
		var code = 0
		var length = out.length
		var l = parent.length

		if (l > 0) {
			for (var i = 0, j = 0, out = []; i < length; i++) {
				for (var k = 0; k < l; k++) {
					out[j++] = scope(selectors[i], parent[k] + ' ')
				}
			}

			length = out.length
		} else {
			for (var i = 0; i < length; i++) {
				out[i] = scope(out[i], '')
			}
		}

		return out
	}

	/**
	 * Scope
	 *
	 * @param {string} input
	 * @param {string} parent
	 * @return {string}
	 */
	function scope (input, parent) {
		var selector = input
		var prefix = parent
		var code = selector.charCodeAt(0)

		switch (code) {
			case NEWLINE:
			case SPACE: {
				code = (selector = selector.trim()).charCodeAt(0)
			}
		}

		if (cascade > 0) {
			switch (code) {
				// &
				case AND: {
					return selector.replace(andptn, prefix.trim())
				}
				// :
				case COLON: {
					switch (selector.charCodeAt(1)) {
						// :global
						case ESCAPE: {
							if (escape > 0) {
								return selector.replace(escapeptn, '$1').replace(andptn, ns).trim()
							}
							break
						}
						default: {
							// :hover
							return prefix.trim() + selector
						}
					}
				}
				default: {
					switch (selector.charCodeAt(selector.length-1)) {
						// html &
						case AND: return selector.replace(andptn, ns)
					}
				}
			}
		}

		return prefix + selector
	}

	/**
	 * Property
	 *
	 * @param {string} input
	 * @param {number} first
	 * @param {number} second
	 * @param {number} third
	 * @param {number} format
	 * @return {string}
	 */
	function property (input, first, second, third, format) {
		var out = (format === 0 ? input : input.replace(formatptn, '')) + ';'
		var length = out.length
		var index = 0
		var cache = ''

		// animation: a, n, i characters
		if (first*2 + second*3 + third*4 === 944) {
			out = animation(out)
		} else if (vendor === 1) {
			// vendor prefix
			switch (first*2 + second*3 + third*4) {
				// appearance: a, p, p
				case 978: {
					out = webkit + out + moz + out + out
					break
				}
				// hyphens: h, y, p
				// user-select: u, s, e
				case 1019:
				case 983: {
					out = webkit + out + moz + out + ms + out + out
					break
				}
				// flex: f, l, e
				case 932: {
					out = webkit + out + ms + out + out
					break
				}
				case 964: {
					// order: o, r, d
					out = webkit + out + ms + flex + '-' + out + out
					break
				}
				// justify-content, j, u, s
				case 1023: {
					cache = out.substring(out.indexOf(':')).replace('flex-', '')
					out = webkit + 'box-pack' + cache + webkit + out + ms + 'flex-pack' + cache + out
					break
				}
				// display(flex/inline-flex): d, i, s
				case 975: {
					if ((index = out.indexOf('flex')) > -1) {
						// e, inline-flex
						cache = out.charCodeAt(index - 2) === 101 ? 'inline-' : ''
						out = out.indexOf(important) !== -1 ? important : ''

						out = (
							display + webkit + cache + 'box' + out + ';' +
							display + webkit + cache + 'flex' + out + ';' +
							display + ms + 'flexbox' + out + ';' +
							display + cache + 'flex' + out + ';'
						)
					}
					break
				}
				// align-items, align-center, align-self: a, l, i, -
				case 938: {
					if (out.charCodeAt(5) === DASH) {
						switch (out.charCodeAt(6)) {
							// align-items, i
							case 105:
								cache = out.replace('-items', '')
								out = webkit + out + webkit + 'box-' + cache + ms + 'flex-' + cache + out
								break
							// align-self, s
							case 115:
								out = ms + 'flex-item-' + out.replace('-self', '') + out;
								break
							// align-content
							default:
								out = ms + 'flex-line-pack' + out.replace('align-content', '') + out;
								break
						}
					}
					break
				}
				// cursor, c, u, r
				case 1005: {
					if (cursorptn.test(out)) {
						out = out.replace(colonptn, ': ' + webkit) + out.replace(colonptn, ': ' + moz) + out
					}
					break
				}
				// width: min-content / width: max-content
				case 953: {
					if ((index = out.indexOf('-content')) > -1) {
						// width: min-content / width: max-content
						cache = out.substring(index - 3)
						out = width + webkit + cache + width + moz + cache + width + cache
					}
					break
				}
				// transform, transition: t, r, a
				// text-size-adjust: t, e, x
				case 962:
				case 1015: {
					out = webkit + out + (out.charCodeAt(5) === 102 ? ms + out : '') + out
					// transitions
					if (second + third === 211 && out.charCodeAt(12) === 115 && out.indexOf(' transform') > -1) {
						out = out.substring(0, out.indexOf(';') + 1).replace(transformptn, webkit + '$1') + out
					}
					break
				}
			}
		}

		return out
	}

	/**
	 * Animation
	 *
	 * @param {string} input
	 * @return {string}
	 */
	function animation (input) {
		var out = ''
		var length = input.length
		var index = input.indexOf(':', 9) + 1
		var declare = input.substring(0, index).trim()
		var body = input.substring(index, length - 1).trim()

		// shorthand
		if (input.charCodeAt(9) !== DASH) {
			var list = body.split(animationptn)

			for (i = 0, index = 0, length = list.length; i < length; index = 0, i++) {
				var value = list[i]
				var props = value.split(propertiesbtn)

				while (value = props[index]) {
					var peak = value.charCodeAt(0)

					if (keyed === 1 && (
						// letters
						(peak > AT && peak < 90) || (peak > 96 && peak < 122) || peak === UNDERSCORE ||
						// dash but not in sequence ex. --
						(peak === DASH && value.charCodeAt(1) !== DASH)
					)) {
						switch (isNaN(parseFloat(value)) + (value.indexOf('(') !== -1)) {
							case 1: {
								switch (value) {
									case 'infinite': case 'alternate': case 'backwards': case 'running':
									case 'normal': case 'forwards': case 'both': case 'none': case 'linear':
									case 'ease': case 'ease-in': case 'ease-out': case 'ease-in-out':
									case 'paused': case 'reversed': case 'alternate-reverse': case 'inherit':
									case 'initial': case 'unset': case 'step-start': case 'step-end':
										break
									default:
										value += key
								}
							}
						}
					}

					props[index++] = value
				}

				out += (i === 0 ? '' : ',') + props.join(' ')
			}
		} else {
			if (input.charCodeAt(10) === 110) {
				out += body + (keyed === 1 ? key : '')
			} else {
				out += body
			}
		}

		out = declare + out + ';'

		return vendor === 1 ? webkit + out + out : out
	}

	/**
	 * Proxy
	 *
	 * @param {number} context
	 * @param {string} blob
	 * @param {string} ns
	 * @param {number} length
	 * @return {(string|void)}
	 */
	function proxy (context, blob, ns, length) {
		for (var i = 0, out = blob; i < plugged; i++) {
			out = plugins[i](context, out, line, cols, ns, length) || out
		}

		if (out !== blob) {
			return out
		}
	}

	/**
	 * Use
	 *
	 * @param {(Array<function(...?)>|function(...?)|void)?} plugin
	 */
	function use (plugin) {
		switch (plugin) {
			case void 0:
			case null: {
				plugged = plugins.length = 0;
				break
			}
			default: {
				switch (plugin.constructor) {
					case Array: {
						for (var i = 0, l = plugin.length; i < l; i++) {
							use(plugin[i++])
						}
						break
					}
					default: {
						plugins[plugged++] = plugin
					}
				}
			}
 		}
	}

	/**
	 * Set
	 *
	 * @param {Object} options
	 */
	function set (options) {
		for (var name in options) {
			var value = options[name]
			switch (name) {
				case 'keyframes': keyed = value|0; break
				case 'global': escade = value|0; break
				case 'cascade': cascade = !!value|0; break
				case 'compress': compress = value|0; break
				case 'prefix': vendor = value|0; break
				case 'plugins': use(value); break
				case 'context': {
					for (var i = 0, condition; i < value.length; i++)
						switch (condition = value[i]) {
							case PREPS: preps = condition|0; break
							case PROPS: props = condition|0; break
							case BLOCK: blcks = condition|0; break
							case POSTS: posts = condition|0; break
						}
					break
				}
			}
		}
	}

	/**
	 * Minify
	 *
	 * @param {string} input
	 * @return {string}
	 */
	function minify (input) {
		return input
			.replace(minifybeforeptn, '')
			.replace(minifyafterptn, '$1')
			.replace(minifytailptn, '$1')
	}

	/**
	 * Stylis
	 *
	 * @param {string} namespace
	 * @param {string} stylesheet
	 * @return {string}
	 */
	function stylis (namespace, stylesheet) {
		// setup
		var code = namespace.charCodeAt(0)
		var output = ''

		if (code < 33) {
			code = (namespace = namespace.trim()).charCodeAt(0)
		}

		if (keyed > 0) {
			key = namespace

			switch (code) {
				// id/class
				case ID:
				case CLASS: {
					key = key.substring(1)
					break
				}
				// attribute
				case ATTRIBUTE: {
					key = key.replace(attributeptn, '$1')
				}
			}

			key = '-' + key.replace(keyptn, '-')
		}

		// build
		output = compile(array, [ns = namespace], stylesheet)

		// destroy
		key = ''
		ns = ''
		column = 0
		line = 0

		return compress === 0 ? output : minify(output)
	}

	stylis['use'] = use
	stylis['set'] = set

	return stylis
}))
