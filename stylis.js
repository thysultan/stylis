/*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * light - weight css preprocessor @licence MIT
 */
/* eslint-disable */
(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
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
	 * This allows the property parser to in theory be both small and fast.
	 */

	var nulptn = /^\0+/g /* matches leading null characters */
	var fmtptn = /[\0\r]/g /* matches new lines and null characters */
	var colonptn = /: */g /* splits animation rules */
	var cursorptn = /zoo|gra/ /* assert cursor varient */
	var transformptn = / *(transform)/g /* vendor prefix transform, older webkit */
	var animationptn = /,+\s*(?![^(]*[)])/g /* splits multiple shorthand notation animations */
	var propertiesbtn = / +\s*(?![^(]*[)])/g /* animation properties */
	var elementptn = / *[\0] */g /* selector elements */
	var selectorptn = /,\r+?/g /* splits selectors */
	var andptn = /&/g /* match & */
	var keyptn = /\W+/g /* removes invalid characters from key */
	var escapeptn = /:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g /* matches :global(.*) */
	var keyframeptn = /@(k\w+s)\s*(\S*)\s*/ /* matches @keyframes $1 */
	var plcholdrptn = /::?(place)/g /* match ::placeholder varient */
	var beforeptn = /\s+(?=[{\];=:>+*])/g /* rm \s before ] ; = : */
	var afterptn = /([[}=:>+*])\s+/g /* rm \s after characters [ } = : */
	var tailptn = /(\{[^{]+?);(?=\})/g /* rm tail semi-colons ;} */
	var pseudoptn = /(:+) */g /* pseudo element */

	/* vendors */
	var webkit = '-webkit-'
	var moz = '-moz-'
	var ms = '-ms-'

	/* character codes */
	var SEMICOLON = 59 /* ; */
	var CLOSEBRACES = 125 /* } */
	var OPENBRACES = 123 /* { */
	var OPENPARENTHESES = 40 /* ( */
	var CLOSEPARENTHESES = 41 /* ) */
	var OPENBRACKET = 91 /* [ */
	var CLOSEBRACKET = 93 /* ] */
	var NEWLINE = 10 /* \n */
	var CARRIAGE = 13 /* \r */
	var TAB = 9 /* \t */
	var AT = 64 /* @ */
	var SPACE = 32 /*   */
	var AND = 38 /* & */
	var HASH = 35 /* # */
	var DOT = 46 /* . */
	var DASH = 45 /* - */
	var UNDERSCORE = 95 /* _ */
	var STAR = 42 /* * */
	var COMMA = 44 /* , */
	var COLON = 58 /* : */
	var SINGLEQUOTE = 39 /* ' */
	var DOUBLEQUOTE = 34 /* " */
	var FOWARDSLASH = 47 /* / */
	var GREATERTHAN = 62 /* > */
	var PLUS = 43 /* + */
	var TILDE = 126 /* ~ */
	var NULL = 0 /* \0 */

	/* special identifiers */
	var KEYFRAME = 107 /* k */
	var MEDIA = 109 /* m */
	var SUPPORTS = 115 /* s */
	var IMPORT = 169 /* i */
	var CHARSET = 163 /* c */
	var FONT = 102 /* f */
	var PLACEHOLDER = 112 /* p */

	var column = 0 /* current column */
	var line = 0 /* current line numebr */
	var pattern = 0 /* :pattern */

	var cascade = 1 /* #id h1 h2 vs h1#id h2#id  */
	var vendor = 1 /* vendor prefix */
	var escape = 1 /* escape :global() pattern */
	var compress = 0 /* compress output */
	var semicolon = 0 /* no/semicolon option */

	/* empty reference */
	var array = []

	/* plugins */
	var plugins = []
	var plugged = 0

	/* plugin context */
	var POSTS = -1
	var PREPS = -2
	var UNKWN = 0
	var PROPS = 1
	var BLCKS = 2
	var ATRUL = 3

	var unkwn = 0

	/* keyframe animation */
	var keyed = 1
	var key = ''

	/* selector namespace */
	var nscopealt = ''
	var nscope = ''

	/**
	 * Compile
	 *
	 * @param {Array<string>} parent
	 * @param {Array<string>} current
	 * @param {string} body
	 * @param {number} from
	 * @return {string}
	 */
	function compile (parent, current, body, from) {
		var brq = 0 /* brackets [] */
		var cmt = 0 /* comments /* // or /* */
		var fnq = 0 /* functions () */
		var str = 0 /* quotes '', "" */

		var first = 0
		var second = 0
		var third = 0
		var counter = 0
		var context = 0
		var atrule = 0

		var pseudo = 0
		var caret = 0
		var code = 0
		var tail = 0
		var trail = 0
		var fmt = 0
		var esc = 0
		var insert = 0
		var length = 0
		var eof = body.length
		var eol = eof - 1

		var char = ''
		var chars = ''
		var out = ''
		var block = ''
		var children = ''
		var flat = ''

		var ref
		var res

		// ...build body
		while (caret < eof) {
			code = body.charCodeAt(caret)

			if (cmt + str + fnq + brq === 0) {
				// auto semicolon insertion
				if (insert === 1) {
					// false flags, comma character
					switch (code) {
						case COMMA: {
							break
						}
						default: {
							caret--
							code = SEMICOLON
						}
					}

					insert = 0
				}

				// eof varient
				switch (caret) {
					case eol: {
						if (fmt > 0) {
							chars = chars.replace(fmtptn, '')
						}

						if ((chars = chars.trim()).length > 0) {
							switch (code) {
								case SPACE:
								case TAB:
								case SEMICOLON:
								case CARRIAGE:
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
						first = chars.charCodeAt(0)
						counter = 1
						caret++

						while (caret < eof) {
							code = body.charCodeAt(caret)

							switch (code) {
								case OPENBRACES: {
									counter++
									break
								}
								case CLOSEBRACES: {
									counter--
									break
								}
							}

							if (counter === 0) {
								break
							}

							block += body.charAt(caret++)
						}

						if (first === NULL) {
							first = (chars = chars.replace(nulptn, '').trim()).charCodeAt(0)
						}

						switch (first) {
							// @at-rule
							case AT: {
								if (fmt > 0) {
									chars = chars.replace(fmtptn, '')
								}

								second = chars.charCodeAt(1)
								block = compile(current, second > 108 ? current : array, block, second)

								// execute plugins, @at-rule context
								if (plugged > 0) {
									ref = select(array, chars)
									res = proxy(ATRUL, block, ref, current, line, column, out.length)
									chars = ref.join('')

									if (res !== void 0) {
										block = res
									}
								}

								switch (second) {
									case MEDIA:
									case SUPPORTS: {
										block = chars + '{' + block + '}'
										break
									}
									case FONT: {
										block = chars + block
										break
									}
									case KEYFRAME: {
										chars = chars.replace(keyframeptn, '$1 $2' + (keyed > 0 ? key : ''))
										block = chars + '{' + block + '}'
										block = '@' + (vendor > 0 ? webkit + block + '@' + block : block)
										break
									}
								}
								break
							}
							// selector
							default: {
								block = compile(current, select(current, chars), block, from)
							}
						}

						children += block
						caret++

						// reset
						context = 0
						pseudo = 0
						fmt = 0
						atrule = 0
						chars = ''

						block = chars
						prefix = chars
						suffix = chars

						break
					}
					case SEMICOLON: {
						if (fmt > 0) {
							chars = chars.replace(fmtptn, '')
						}

						chars = chars.trim()

						// execute plugins, property context
						if (plugged > 0) {
							if ((res = proxy(PROPS, chars, current, parent, line, column, out.length)) !== void 0) {
								chars = res.trim()
							}
						}

						first = chars.charCodeAt(0)
						second = chars.charCodeAt(1)
						third = chars.charCodeAt(2)

						switch (first + second) {
							case IMPORT:
							case CHARSET: {
								flat += chars + body.charAt(caret)
								break
							}
							default: {
								out += property(chars, first, second, third)
							}
						}

						caret++

						// reset
						context = 0
						pseudo = 0
						fmt = 0
						chars = ''

						break
					}
				}
			}

			// parse characters
			switch (code) {
				case CARRIAGE:
				case NEWLINE: {
					// auto insert semicolon
					if (cmt + str + fnq + brq + semicolon === 0) {
						// valid characters that
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
								// colon : present? register for auto semicolon insertion
								if (pseudo > 0) {
									insert = 1
								}
							}
						}
					}

					// terminate line comment
					if (cmt === FOWARDSLASH) {
						cmt = 0
					}

					// execute plugins, newline context
					if (plugged * unkwn > 0) {
						proxy(UNKWN, chars, current, parent, line, column, out.length)
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

					// current character
					char = body.charAt(caret)

					// remove comments, escade functions, strings, attributes and prepare selectors
					switch (code) {
						// :p<l>aceholder
						// :g<l>obal
						case 108: {
							if (str + cmt + brq + pattern === 0 && pseudo > 0 && caret - pseudo === 2) {
								pattern = tail
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
								fmt = 1
								char += '\r'
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
								fnq--
							}
							break
						}
						case OPENPARENTHESES: {
							if (str + cmt + brq === 0) {
								if (context === 0) {
									switch (tail*2 + trail*3) {
										// :not
										case 565: {
											break
										}
										// global, nth-child etc...
										default: {
											counter = 0
											context = 1
										}
									}
								}
								fnq++
							}
							break
						}
						case AT: {
							if (cmt + fnq + str + brq + pseudo + atrule === 0) {
								atrule = 1
							}
							break
						}
						// block/line comments
						case STAR:
						case FOWARDSLASH: {
							if (str + brq + fnq > 0) {
								break
							}

							switch (cmt) {
								case 0: {
									switch (code*2 + body.charCodeAt(caret+1)*3) {
										// //
										case 235: {
											cmt = FOWARDSLASH
											break
										}
										// /*
										case 220: {
											cmt = STAR
											break
										}
									}
									break
								}
								case STAR: {
									if (code === FOWARDSLASH && tail === STAR) {
										char = ''
										cmt = 0
									}
								}
							}
						}
					}

					// ignore comment blocks
					if (cmt === 0) {
						// aggressive isolation mode, divide each individual selector
						// including selectors in :not function but excluding selectors in :global function
						if (cascade + str + brq + atrule === 0 && from !== KEYFRAME) {
							switch ((fmt = 1, code)) {
								case COMMA:
								case TILDE:
								case GREATERTHAN:
								case PLUS:
								case CLOSEPARENTHESES:
								case OPENPARENTHESES: {
									if (context === 0) {
										switch (tail) {
											case TAB:
											case SPACE:
											case NEWLINE:
											case CARRIAGE: {
												char = char + '\0'
												break
											}
											default: {
												char = '\0' + char + '\0'
											}
										}
									} else {
										switch (code) {
											case OPENPARENTHESES: {
												context = ++counter
												break
											}
											case CLOSEPARENTHESES: {
												if ((context = --counter) === 0) {
													char += '\0'
												}
												break
											}
										}
									}
									break
								}
								case SPACE: {
									switch (tail) {
										case TAB:
										case SPACE:
										case NEWLINE:
										case CARRIAGE: {
											break
										}
										default: {
											if (context === 0) {
												char += '\0'
											}
										}
									}
								}
							}
						}

						// concat buffer of characters
						chars += char
					}
				}
			}

			// tail characters
			trail = tail
			tail = code

			// visit every character
			caret++
		}

		if (fmt > 0) {
			out = out.replace(fmtptn, '')
		}

		length = out.length

		// execute plugins, block context
		if (length > 0 && plugged > 0) {
			res = proxy(BLCKS, out, current, parent, line, column, length)

			if (res !== void 0) {
				length = (out = res).length
			}
		}

		if (length > 0) {
			if (cascade === 0 && from !== KEYFRAME) {
				isolate(current)
			}

			out = current.join(',').trim() + '{' + out + '}'

			switch (pattern) {
				case 0: {
					break
				}
				case PLACEHOLDER: {
					// :placeholder
					out = (out.replace(plcholdrptn, '::' + webkit + 'input-$1') +
						out.replace(plcholdrptn, '::' + moz + '$1') +
						out.replace(plcholdrptn, ':' + ms + 'input-$1') + out)
				}
				default: {
					pattern = 0
				}
			}
		}

		return flat + out + children
	}

	/**
	 * Select
	 *
	 * @param {Array<string>} parent
	 * @param {string} current
	 * @return {Array<string>}
	 */
	function select (parent, current) {
		var selectors = current.trim().split(selectorptn)
		var out = selectors

		var length = out.length
		var l = parent.length

		switch (l) {
			case 0:
			case 1: {
				for (var i = 0, ref = l === 0 ? '' : parent[0] + ' '; i < length; i++) {
					out[i] = scope(out[i], ref, l).trim()
				}
				break
			}
			// nested
			default: {
				for (var i = 0, j = 0, out = []; i < length; i++) {
					for (var k = 0; k < l; k++) {
						out[j++] = scope(selectors[i], parent[k] + ' ', l).trim()
					}
				}
			}
		}

		return out
	}

	/**
	 * Scope
	 *
	 * @param {string} input
	 * @param {string} parent
	 * @param {number} level
	 * @return {string}
	 */
	function scope (input, parent, level) {
		var selector = input
		var prefix = parent
		var code = selector.charCodeAt(0)

		switch (code) {
			case NULL: {
				selector = selector.replace(nulptn, '')
			}
			case CARRIAGE:
			case NEWLINE:
			case SPACE: {
				code = (selector = selector.trim()).charCodeAt(0)
			}
		}

		switch (code) {
			// &
			case AND: {
				switch (cascade + level) {
					case 0:
					case 1: {
						if (parent.trim().length === 0) {
							break
						}
					}
					default: {
						return selector.replace(andptn, prefix.trim())
					}
				}
				break
			}
			// :
			case COLON: {
				switch (selector.charCodeAt(1)) {
					// g in :global
					case 103: {
						if (escape > 0 && cascade > 0) {
							return selector.replace(escapeptn, '$1').replace(andptn, nscope)
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
					case AND: {
						return prefix.replace(nscope, '').trim() + ' ' + selector.replace(andptn, nscope)
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
	 * @return {string}
	 */
	function property (input, first, second, third) {
		var out = input + ';'
		var index = 0
		var hash = (first*2) + (second*3) + (third*4)
		var cache

		// animation: a, n, i characters
		if (hash === 944) {
			out = animation(out)
		} else if (vendor > 0) {
			// vendor prefix
			switch (hash) {
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
					cache = out.substring(out.indexOf(':', 15)).replace('flex-', '')
					out = webkit + 'box-pack' + cache + webkit + out + ms + 'flex-pack' + cache + out
					break
				}
				// display(flex/inline-flex): d, i, s
				case 975: {
					if ((index = out.indexOf('flex', 8)) > 0) {
						// e, inline-flex
						cache = out.charCodeAt(index - 2) === 101 ? 'inline-' : ''
						out = out.indexOf('!important', 8) > 0 ? '!important' : ''

						out = (
							'display:' + webkit + cache + 'box' + out + ';' +
							'display:' + webkit + cache + 'flex' + out + ';' +
							'display:' + ms + 'flexbox' + out + ';' +
							'display:' + cache + 'flex' + out + ';'
						)
					}
					break
				}
				// align-items, align-center, align-self: a, l, i, -
				case 938: {
					if (out.charCodeAt(5) === DASH) {
						switch (out.charCodeAt(6)) {
							// align-items, i
							case 105: {
								cache = out.replace('-items', '')
								out = webkit + out + webkit + 'box-' + cache + ms + 'flex-' + cache + out
								break
							}
							// align-self, s
							case 115: {
								out = webkit + out + ms + 'flex-item-' + out.replace('-self', '') + out
								break
							}
							// align-content
							default: {
								out = webkit + out + ms + 'flex-line-pack' + out.replace('align-content', '') + out
							}
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
					if ((index = out.indexOf('-content', 9)) > 0) {
						// width: min-content / width: max-content
						cache = out.substring(index - 3)
						out = 'width:' + webkit + cache + 'width:' + moz + cache + 'width:' + cache
					}
					break
				}
				// transform, transition: t, r, a
				// text-size-adjust: t, e, x
				case 962:
				case 1015: {
					out = webkit + out + (out.charCodeAt(5) === 102 ? ms + out : '') + out

					// transitions
					if (second + third === 211 && out.charCodeAt(13) === 105 && out.indexOf('transform', 10) > 0) {
						out = out.substring(0, out.indexOf(';', 27) + 1).replace(transformptn, webkit + '$1') + out
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
		var length = input.length
		var index = input.indexOf(':', 9) + 1
		var declare = input.substring(0, index).trim()
		var body = input.substring(index, length - 1).trim()
		var out = ''

		// shorthand
		if (input.charCodeAt(9) !== DASH) {
			var list = body.split(animationptn)

			for (i = 0, index = 0, length = list.length; i < length; index = 0, i++) {
				var value = list[i]
				var items = value.split(propertiesbtn)

				while (value = items[index]) {
					var peak = value.charCodeAt(0)

					if (keyed === 1 && (
						// letters
						(peak > AT && peak < 90) || (peak > 96 && peak < 122) || peak === UNDERSCORE ||
						// dash but not in sequence ex. --
						(peak === DASH && value.charCodeAt(1) !== DASH)
					)) {
						// not a number/function
						switch (isNaN(parseFloat(value)) + (value.indexOf('(') !== -1)) {
							case 1: {
								switch (value) {
									case 'infinite': case 'alternate': case 'backwards': case 'running':
									case 'normal': case 'forwards': case 'both': case 'none': case 'linear':
									case 'ease': case 'ease-in': case 'ease-out': case 'ease-in-out':
									case 'paused': case 'reversed': case 'alternate-reverse': case 'inherit':
									case 'initial': case 'unset': case 'step-start': case 'step-end': {
										break
									}
									default: {
										value += key
									}
								}
							}
						}
					}

					items[index++] = value
				}

				out += (i === 0 ? '' : ',') + items.join(' ')
			}
		} else {
			out += input.charCodeAt(10) === 110 ? body + (keyed === 1 ? key : '') : body
		}

		out = declare + out + ';'

		return vendor > 0 ? webkit + out + out : out
	}

	/**
	 * Isolate
	 *
	 * @param {Array<string>} selectors
	 */
	function isolate (selectors) {
		for (var i = 0, length = selectors.length, prefix, element; i < length; i++) {
			var elements = selectors[i].split(elementptn)
			var out = ''

			for (var j = size = ctx = tail = code = 0, l = elements.length; j < l; j++) {
				if ((size = (element = elements[j]).length) === 0 && l > 1) {
					continue
				}

				prefix = ' '
				tail = out.charCodeAt(out.length-1)
				code = element.charCodeAt(0)

				if (j === 0) {
					prefix = ''
				} else {
					switch (tail) {
						case TILDE:
						case GREATERTHAN:
						case PLUS:
						case SPACE:
						case OPENPARENTHESES:  {
							prefix = ''
						}
					}
				}

				switch (code) {
					case AND: {
						element = ''
					}
					case HASH:
					case DOT: {
						element = prefix + element + nscopealt
					}
					case TILDE:
					case GREATERTHAN:
					case PLUS:
					case SPACE:
					case CLOSEPARENTHESES:
					case OPENPARENTHESES: {
						break
					}
					case OPENBRACKET: {
						element = (ctx = 1, prefix + element + nscopealt)
						break
					}
					case COLON: {
						switch (element.charCodeAt(1)*2 + element.charCodeAt(2)*3) {
							// :global
							case 530: {
								element = prefix + element.substring(8, size - 1)
							}
							// :not
							case 553: {
								break
							}
							// :hover, :nth-child(), ...
							default: {
								element = (ctx === 2 ? '' : prefix + nscopealt) + element
							}
						}
						break
					}
					default: {
						if (size > 1 && element.indexOf(':') > 0) {
							element = prefix + element.replace(pseudoptn, nscopealt + '$1')
						} else {
							element = (ctx = 1, prefix + element + nscopealt)
						}
					}
				}

				ctx = ctx === 1 ? 2 : (ctx === 2 ? 0 : ctx)
				out += element
			}

			selectors[i] = out.replace(fmtptn, '').trim()
		}
	}

	/**
	 * Stylis
	 *
	 * @param {string} selector
	 * @param {string} input
	 * @return {string}
	 */
	function stylis (selector, input) {
		// setup
		var ns = selector
		var code = ns.charCodeAt(0)

		// leading whitespace
		if (code < 33) {
			code = (ns = ns.trim()).charCodeAt(0)
		}

		// keyframe/animation namespace
		if (keyed > 0) {
			key = ns.replace(keyptn, code === OPENBRACKET ? '' : '-')
		}

		// cascade/isolate
		if (cascade === 1) {
			nscope = ns
		} else {
			nscopealt = ns
		}

		var selectors = [nscope]

		// execute plugins, pre-process context
		if (plugged > 0) {
			proxy(PREPS, input, selectors, selectors, line, column, 0)
		}

		// build
		var output = compile(array, selectors, input, 0)

		// execute plugins, post-process context
		if (plugged > 0) {
			proxy(POSTS, output, selectors, selectors, line, column, output.length)
		}

		// destroy
		key = ''
		nscope = ''
		nscopealt = ''
		line = 0
		column = 0
		pattern = 0

		return compress === 0 ? output : minify(output)
	}

	/**
	 * Proxy
	 *
	 * @param {number} context
	 * @param {string} content
	 * @param {Array<string>} selectors
	 * @param {Array<string>} parents
	 * @param {number} line
	 * @param {number} column
	 * @param {number} length
	 * @return {(string|void)}
	 */
	function proxy (context, content, selectors, parents, line, column, length) {
		for (var i = 0, out = content; i < plugged; i++) {
			out = plugins[i](context, out, selectors, parents, line, column, length)
		}

		switch (out) {
			case null:
			case void 0:
			case content: {
				break
			}
			default: {
				return out + ''
			}
		}
	}

	/**
	 * Use
	 *
	 * @param {(Array<function(...?)>|function(...?)|number|void)?} plugin
	 */
	function use (plugin) {
		switch (plugin) {
			case void 0:
			case null: {
				plugged = plugins.length = 0
				break
			}
			default: {
				switch (plugin.constructor) {
					case Array: {
						for (var i = 0, length = plugin.length; i < length; i++) {
							use(plugin[i])
						}
						break
					}
					case Function: {
						plugins[plugged++] = plugin
						break
					}
					case Boolean: {
						unkwn = !!plugin|0
					}
				}
			}
 		}

 		return use
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
				case 'keyframe': keyed = value|0; break
				case 'global': escade = value|0; break
				case 'cascade': cascade = value|0; break
				case 'compress': compress = value|0; break
				case 'prefix': vendor = value|0; break
				case 'semicolon': semicolon = value|0; break
			}
		}

		return set
	}

	/**
	 * Minify
	 *
	 * @param {string} output
	 * @return {string}
	 */
	function minify (output) {
		return output
			.replace(fmtptn, '')
			.replace(beforeptn, '')
			.replace(afterptn, '$1')
			.replace(tailptn, '$1')
	}

	stylis['use'] = use
	stylis['set'] = set

	return stylis
}))
