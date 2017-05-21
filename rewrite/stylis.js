/*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * stylis is a light – weight css preprocessor @licence MIT
 */
/* eslint-disable */
(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module.exports = factory()) :
		typeof define === 'function' && define.amd ? define(factory()) :
			(window.stylis = factory(window))
}(function () {

	/**
	 * Notes
	 *
	 * int + int + int === int [faster]
	 *
	 * vs
	 *
	 * int === int && int === int
	 *
	 * operating on interger values is faster than a second condtion statement
	 *
	 * switch (int) { case ints...} [faster]
	 *
	 * vs
	 *
	 * if (int == 1 && int === 1 ...)
	 *
	 */

	'use strict'

	/* reusable string varients */
	var empty = ''
	var space = ' '
	var comma = ','
	var rbraces = '}'
	var lbraces = '{'
	var colon = ':'
	var semi = ';'
	var carriage = '\r'
	var newline = '\n'
	var dash = '-'
	var capture = '$1'
	var webkit = '-webkit-'
	var moz = '-moz-'
	var ms = '-ms-'
	var cont = '-content'
	var important = space+'!important'
	var display = 'display:'
	var flex = 'flex'
	var box = 'box'
	var width = 'width:'
	var keyframes = 'keyframes'
	var unique = '%%'
	var unknown = empty

	var array = [empty]
	var plugins = []

	var pcarriage = /\r/g /* match carriage characters */
	var pspace = / /g /* match space characters */
	var pand = /&/g /* match all & characters */
	var pnewline = /\n/g /* match newline characters */
	var psplit = /,\n/g /* splits selectors */
	var pplace = /::place/g /* asserts ::placeholder varient */
	var pcolon = /: */g /* splits animation rules into propert: declaration */
	var pscope = /[ .#~+>]+|^\d/g /* removes invalid characters in keyframe scoped name */
	var pprops = / +\s*(?![^(]*[)])/g
	var panimation = /,+\s*(?![^(]*[)])/g /* splits multiple animations in shorthand */
	var pkeyrames = /keyframes\s+([^\s{]*)\s*/ /* findes the name of a keyframe */
	var pcursor = /zoo|gra/ /* asserts the cursor varient */
	var pescape = /[-\/\\^$*+?.()|[\]{}]/g /*	escapes regex when liniting */
	var pglobal = /:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g /* matches :global(..) */
	var ptransform = / *(transform)/g /* vendor prefix transform for older webkit */
	var pminifybefore = /\s+(?=[{\];=:])/g /* rm \s before characters outside of strings */
	var pminifyafter = /([[}=:])\s+/g /* rm \s after characters outside of strings */
	var pminifytail = /(\{[^{]+?);(?=\})/g /* rm tail semi-colons ;} */
	var ppseudo = /(:+) */g /* capture :pseudo selectors */
	var punique = /%%/g
	var ppatch = /([^[#.>~+\s])%%/g
	var ptype = /^[^[#.>~+\s]+/

	/* settings */
	var prefix = 1
	var scope = 1
	var cascade = 1
	var global = 1
	var compress = 0
	var plugged = 0
	var recurse = 0

	/* aggressive cascade isolation */
	var namescope = 0
	var namespace = empty

	/* character codes */
	var NEWLINE = 10
	var CARRIAGE = 13
	var TAB = 9
	var SEMICOLON = 59
	var COLON = 58
	var LBRACE = 123
	var RBRACE = 125
	var COMMA = 44
	var DQUOTE = 34
	var SQUOTE = 39
	var LPAREN = 40
	var RPAREN = 41
	var FSLASH = 47
	var STAR = 42
	var LINECOMMENT = 1
	var BLOCKCOMMENT = 2
	var AT = 64
	var SPACE = 32
	var AND = 38
	var HASH = 35
	var DOT = 46
	var LBRACKET = 91
	var RBRACKET = 93
	var DASH = 45
	var UNDERSCORE = 95

	var ID = 35
	var CLASS = 46
	var SIBLING = 126
	var CHILD = 62
	var ADJACENT = 43
	var ATTRIBUTE = LBRACKET

	var KEYFRAME = 107
	var MEDIA = 109
	var SUPPORTS = 115
	var IMPORT = 105
	var CHARSET = 99
	var GLOBAL = 103

	var NEST = 1
	var BLOCK = 2
	var UNKNOWN = 3
	var FLAT = 4

	/* context signatures */
	var PREPCTX = 0 /* preparation */
	var SELECTX = 1 /* selector */
	var RULECTX = 2 /* rule */
	var PROPCTX = 3 /* property */
	var BLCKCTX = 4 /* block */
	var POSTCTX = 5 /* post-process */
	var UNKNCTX = 6 /* unknown */

	/* context settings */
	var prepctx = 1 /* on/off preparation */
	var selectx = 1 /* on/off selector */
	var rulectx = 1 /* on/off rule */
	var propctx = 1 /* on/off property */
	var blckctx = 1 /* on/off block */
	var postctx = 1 /* on/off post-process */
	var unknctx = 0 /* on/off unknown */

	/**
	 * Compile
	 *
	 * @param {String} selection
	 * @param {String} input
	 * @return {String}
	 */
	function compile (selection, input) {
		var selector = selection
		var id = selection

		var eol = input.length
		var eof = eol + 1

		var line = 1
		var caret = 0
		var depth = 0
		var cols = 0

		var type = 0
		var flatten = 0
		var nested = 0
		var token = 0
		var place = 0
		var com = 0
		var fun = 0
		var str = 0
		var attr = 0
		var peak = 0
		var first = 0
		var second = 0
		var third = 0
		var size = 0
		var index = 0
		var operation = 0
		var count = 0
		var i = 0
		var length = 0
		var tail = 0
		var join = 0
		var rune = 0
		var pseudo = 0
		var globals = 0
		var format = 0
		var skip = 0
		var code = 0

		var current = empty
		var output = empty
		var char = empty
		var frame = empty
		var cache = empty
		var stack = empty
		var body = empty
		var flat = empty
		var block = empty
		var key = empty

		var properties = array
		var previous = array
		var selectors = array
		var collection = array

		switch (selection.constructor) {
			case Number:
				selector += empty
				break
			case Array:
				selector = selection.join(empty)

				if ((type = selection.length) > 1 || cascade === 0) {
					id = unique
				} else {
					id = selector
				}

				break
		}

		if ((code = selector.charCodeAt(0)) < 33) {
			code = (selector = selector.trim()).charCodeAt(0)
			id = id.trim()
		}

		if (scope === 1) {
			switch (code) {
				// id/class
				case DOT: case HASH: key = selector.substring(1); break
				case LBRACKET:
					// `[data-id=$]` -> ['data-id', '$']
					properties = selector.substring(1, selector.length - 1).split('=')
					size = properties.length
					key = key = size > 1 ? properties[1] : properties[0]

					// [data-id="$"]/[data-id='$'] --> "$"/'$' --> $
					switch (key.charCodeAt(0)) {
						case DQUOTE: case SQUOTE: key = key.substring(1, key.length-1)
					}

					selector = '['+ properties[0] + (size > 1 ? ('=' + key +']') : ']')
					break
				default: key = selector
			}

			var key = key.replace(pscope, dash)
		}

		// plugin, pre context
		if (plugged > 0 && propctx > 0) {
			var plugin = plugged > 1 ? proxy : plugins[0]

			if (recurse === 0) {
				switch (cache = plugin(PREPCTX, input, line, cols, id, 0)) {
					case null:
					case void 0: break;
					default:
						eol = (input = cache).length
						eof = eol + 1
				}
			}
		}

		main: while (caret < eof) {
			switch (code = input.charCodeAt(caret)) {
				case SEMICOLON: if (caret === eol) flatten = 1, code = SEMICOLON
				case LBRACE: case RBRACE: token = 1; break
				default: token = caret === eol ? 1 : 0
			}

			if (token === 1 && com + fun + str + attr === 0) {
				cols++
				frame += (input.charAt(caret))

				// trim leading whitespace
				switch (first = frame.charCodeAt(0)) {
					case SPACE:
					case TAB:
					case NEWLINE:
						first = (frame = frame.trim()).charCodeAt(0)

						if (caret === eol && frame.length === 0) {
							switch (stack.length) {
								case 0:
									if (flat.length === 0) {
										break main
									}
									break
								default:
									code = RBRACE
							}
						}
				}

				if (plugged > 0 && code !== RBRACE && operation === 0) {
					if (selectx > 0 && code === LBRACE) {
						// plugin selector context
						cache = plugin(SELECTX, frame.substring(0, frame.length-1).trim(), line, cols, id, output.length)
					} else if (propctx > 0) {
						// plugin property context
						cache = plugin(PROPCTX, frame, line, cols, id, output.length)
					}

					if (propctx + selectx > 0) {
						switch (cache) {
							case null:
							case void 0:
								break
							default:
								if (code === LBRACE) {
									frame = cache + space + lbraces
								} else {
									frame = cache
								}

								first = frame.charCodeAt(0)
						}
					}
				}

				if ((size = frame.length) > 0) {
					second = frame.charCodeAt(1)
					third = frame.charCodeAt(2)

					if (first === AT) {
						switch (second) {
							case SUPPORTS:
							case MEDIA:
								operation = BLOCK
								if (depth === 0) {
									depth++
								}
								break
							case CHARSET:
							case IMPORT:
								operation = FLAT
								break
							case KEYFRAME:
								operation = KEYFRAME
								break
							default:
								operation = UNKNOWN
						}
					}

					switch (code) {
						case LBRACE: {
							depth++

							switch (operation) {
								case KEYFRAME:
								case UNKNOWN: break
								default: {
									if (depth > 1) {
										depth--
										caret++
										count = 1
										body = empty

										while (caret < eof) {
											switch (input.charCodeAt(caret)) {
												case LBRACE: count++; break
												case RBRACE: count--; break
											}

											if (count === 0) {
												break
											}

											body += input.charAt(caret++)
										}

										switch (first) {
											case AT:
												body = body.trim();
												break
											default:
												body = frame + body + rbraces

												if (cascade === 0) {
													namescope = 1
													namespace = unique
												}
										}

										switch (operation) {
											case BLOCK: {
												code = RBRACE
												block += frame

												if (previous === array && previous[0].length === 0) {
													switch (type) {
														case 0: previous[0] = id; break
														case 1: previous[0] = id[0]; break
													}
												}
											}
										}

										recurse = 1
										block += compile(previous, body).trim()

										recurse = 0
										nested = 1
										frame = empty

										if (namescope === 1) {
											namescope = 0
											namespace = empty
										}
									} else if (operation === 0) {
										// :placeholder
										if (place === 0 && frame.indexOf(colon+colon+'place') !== -1) {
											place = 1
										}

										selectors = frame.substring(0, size-1).trim().split(psplit)
										length = selectors.length

										for (i = 0; i < length; i++) {
											if ((rune = (current = selectors[i]).charCodeAt(0)) === SPACE) {
												rune = (current = current.trim()).charCodeAt(0)
											}

											switch (cascade) {
												case 1: {
													switch (rune) {
														case AND:
															current = id + current.substring(1).replace(pand, id);
															break
														default:
															if (rune === COLON) {
																switch (current.charCodeAt(1)) {
																	case GLOBAL:
																		if (global > 0) {
																			current = current.replace(pglobal, capture).replace(pand, id).trim()
																		}
																		break
																	default:
																		current = id + current
																}
															} else if (current.indexOf(space+'&') > 0) {
																// html &
																current = current.replace(pand, id).trim()
															} else {
																current = id + space + current
															}
													}
													break
												}
												case 0: {
													// aggressive cascade isolation
													collection = current.split(pcarriage)
													size = collection.length

													for (index = 0; index < size; index++) {
														rune = (cache = collection[index]).charCodeAt(0);
														tail = cache.charCodeAt((count = cache.length) - 1)

														if (rune === SPACE && count > 1) {
															rune = (cache = cache.trim()).charCodeAt(0)
															count = cache.length
														}

														switch (rune) {
															case SPACE:
															case ID:
															case CLASS:
															case SIBLING:
															case CHILD:
															case ADJACENT:
															case RPAREN:
															case LPAREN:
																break
															case AND:
																cache = cache.replace(pand, id)
																break
															case COLON:
																switch (cache.charCodeAt(1)) {
																	case GLOBAL: {
																		cache = (
																			cache.substring(8, count-1) +
																			(tail === SPACE ? cache.substring(cache.lastIndexOf(')')+1) : empty)
																		);
																		break
																	}
																	// :global(...):not
																	case 110: break
																	default: cache = id + cache
																}
																break
															case LBRACKET:
																cache = tail === SPACE ? cache.trim() + id + space : cache + id
																break
															default:
																if (count > 1 && cache.indexOf(colon) > 0) {
																	cache = cache.replace(ppseudo, id + capture)
																} else if (count > 0) {
																	cache = tail === SPACE ? cache.trim() + id + space : cache + id
																}
														}

														collection[index] = cache
													}

													current = collection.join(carriage).replace(pcarriage, empty)

													if (namescope === 1) {
														if (current.indexOf(unique) !== 0) {
															current = namespace + space + current
														}
													}
												}
											}

											// plugin, selector context
											if (plugged > 0 && rulectx > 0) {
												switch (cache = plugin(RULECTX, current, line, cols, id, output.length)) {
													case null:
													case void 0:
														break
													default:
														current = cache
												}
											}

											selectors[i] = current
										}

										previous = selectors

										if (type > 0) {
											selectors = nest(selection, selectors, length, type)
										}

										frame = selectors.join(comma) + lbraces
									}
								}
							}

							break
						}
						case RBRACE: {
							if (size < 2) {
								break
							}
						}
						default: {
							if (join === 1) {
								frame = frame.replace(pnewline, empty)
							}

							// semicolon insertion
							if (code !== SEMICOLON) {
								frame = (code === RBRACE ? frame.substring(0, size - 1) : frame).trim() + semi
							}

							// animations
							if (first === 97 && second === 110 && third === 105) {
								// animation: a, n, i characters
								frame = frame.substring(0, size-1)
								index = frame.indexOf(colon)+1
								cache = frame.substring(0, index)
								body = frame.substring(index).trim()

								// shorthand
								if (frame.charCodeAt(9) !== DASH) {
									length = (collection = body.split(panimation)).length

									for (i = 0, index = 0; i < length; index = 0, i++) {
										current = collection[i]
										properties = current.split(pprops)

										while (current = properties[index]) {
											peak = current.charCodeAt(0)

											if (scope === 1 && (
												// letters
												(peak > AT && peak < 90) || (peak > 96 && peak < 122) || peak === UNDERSCORE ||
												// dash but not in sequence ex. --
												(peak === DASH && current.charCodeAt(1) !== DASH)
											)) {
												switch (isNaN(parseFloat(current)) + (current.indexOf('(') !== -1)) {
													case 1: {
														switch (current) {
															case 'infinite': case 'alternate': case 'backwards': case 'running':
															case 'normal': case 'forwards': case 'both': case 'none': case 'linear':
															case 'ease': case 'ease-in': case 'ease-out': case 'ease-in-out':
															case 'paused': case 'reversed': case 'alternate-reverse': case 'inherit':
															case 'initial': case 'unset': case 'step-start': case 'step-end':
																break
															default:
																current += dash + key
														}
													}
												}
											}

											properties[index++] = current
										}

										cache += (i === 0 ? empty : comma) + properties.join(space)
									}
								} else {
									switch (frame.charCodeAt(10)) {
										case 110:
											cache += body + (scope === 1 ? dash + key : empty)
											break
										default:
											cache += body
									}
								}

								cache += semi
								frame = prefix === 1 ? webkit + cache + cache : cache

								if (code === RBRACE) {
									frame += rbraces
								}
							} else if (prefix === 1) {
								// vendor prefixer
								switch (first*2 + second*3 + third*4) {
									// appearance: a, p, p
									case 978: {
										frame = webkit + frame + moz + frame + frame
										break
									}
									// hyphens: h, y, p
									// user-select: u, s, e
									case 1019:
									case 983: {
										frame = webkit + frame + moz + frame + ms + frame + frame
										break
									}
									// flex: f, l, e
									case 932: {
										frame = webkit + frame + ms + frame + frame
										break
									}
									case 964: {
										// order: o, r, d
										frame = webkit + frame + ms + flex+ dash + frame + frame
										break
									}
									// justify-content, j, u, s
									case 1023: {
										cache = frame.substring(frame.indexOf(colon)).replace(flex + dash, empty)
										frame = webkit + box + dash + 'pack' + cache + webkit + frame + ms + flex + dash + 'pack' + cache + frame
										break
									}
									// display(flex/inline-flex): d, i, s
									case 975: {
										if ((index = frame.indexOf(flex)) !== -1) {
											// e, inline-flex
											cache = frame.charCodeAt(index-2) === 101 ? 'inline' + dash : empty
											frame = frame.indexOf(important) !== -1 ? important : empty
											frame = (
												display + webkit + cache + box + frame + semi +
												display + webkit + cache + flex + frame + semi +
												display + ms + flex + box + frame + semi +
												display + cache + flex + frame + semi
											)
										}
										break
									}
									// align-items, align-center, align-self: a, l, i, -
									case 938: {
										if (frame.charCodeAt(5) === DASH) {
											switch (frame.charCodeAt(6)) {
												// align-items, i
												case 105:
													cache = frame.replace(dash+'items', empty)
													frame = webkit + frame + webkit + box + dash + cache + ms + flex + dash + cache + frame
													break
												// align-self, s
												case 115:
													frame = ms + flex + dash + 'item' + dash + frame.replace(dash+'self', empty) + frame;
													break
												// align-content
												default:
													frame = ms + flex+dash+'line'+dash+'pack' + frame.replace('align'+dash+'content', empty) + frame;
													break
											}
										}
										break
									}
									// cursor, c, u, r
									case 1005: {
										if (pcursor.test(frame)) {
											frame = frame.replace(pcolon, colon+space+webkit) + frame.replace(pcolon, colon+space+moz) + frame
										}
										break
									}
									// width: min-content / width: max-content
									case 953: {
										if ((index = frame.indexOf(cont)) !== -1) {
											// width: min-content / width: max-content
											cache = frame.substring(index - 3)
											frame = width + webkit + cache + width + moz + cache + width + cache
										}
										break
									}
									// transform, transition: t, r, a
									// text-size-adjust: t, e, x
									case 962:
									case 1015: {
										frame = webkit + frame + (frame.charCodeAt(5) === 102 ? ms + frame : empty) + frame
										// transitions
										if (second + third === 211 && frame.charCodeAt(12) === 115 && frame.indexOf(space+'transform') > -1) {
											frame = frame.substring(0, frame.indexOf(semi)+1).replace(ptransform, webkit+capture) + frame
										}
										break
									}
								}
							}

							// semicolon insertion
							if (code !== SEMICOLON) {
								frame = frame.substring(0, (size = frame.length) - 1)

								if (code === RBRACE) {
									frame += rbraces
								}
							}

							// build flat
							if (depth === 0 && code === SEMICOLON) {
								switch (operation) {
									case FLAT:
										stack += frame
										break
									default:
										flatten = 1
										flat += frame
								}

								frame = empty
								caret++
								continue
							}

							break
						}
					}

					stack += frame
				}

				// push flat css
				if (flatten === 1 && code !== SEMICOLON) {
					if (caret === eol) {
						flat += frame
						frame = empty
					}

					if (type > 1) {
						flat = nest(selection, [id], 1, type).join(comma) + lbraces + flat + rbraces
					} else {
						flat = id + lbraces + flat + rbraces
					}

					// plugin, block context
					if (plugged > 0 && blckctx > 0) {
						switch (cache = plugin(BLCKCTX, flat, line, cols, id, output.length)) {
							case null:
							case void 0:
								break
							default:
								flat = cache
						}
					}

					output += flat
					flatten = 0
					flat = empty
				}

				// push block
				if (code === RBRACE) {
					size = stack.length

					if (previous !== array) {
						previous = array
					}

					if (depth > 0) {
						depth--
					}

					if (place === 1) {
						// :placeholder
						place = 0
						stack = (stack.replace(pplace, colon+colon+webkit+'input'+dash+'place') +
							stack.replace(pplace, colon+colon+moz+'place') +
							stack.replace(pplace, colon+ms+'input'+dash+'place') + stack)
					} else if (operation === KEYFRAME) {
						stack = stack.substring(1)

						if (scope === 1) {
							stack = keyframes + space + stack.replace(pkeyrames, capture+dash+key).trim()
						}

						switch (prefix) {
							case 1: stack = webkit + stack + rbraces + '@' + stack
							default: stack = '@' + stack
						}
					} else if (nested === 1) {
						switch (operation) {
							case BLOCK:
								if (size === 0 || stack.charCodeAt(size-1) === LBRACE) {
									stack = block
								} else {
									stack += rbraces + block
								}

								stack += rbraces
								break
							default: {
								switch (stack.charCodeAt(stack.length-2)) {
									case LBRACE:
										stack = empty
									default:
										stack += block
								}
							}
						}

						block = empty
						nested = 0
					}

					// plugin, block context
					if (plugged > 0 && blckctx > 0)
						switch (cache = plugin(BLCKCTX, stack, line, cols, id, output.length)) {
							case null:
							case void 0:
								break
							default:
								size = (stack = cache).length
						}

					// empty block
					if ((size = stack.length) > 0) {
						switch (size) {
							case 1:
								switch (output.charCodeAt(output.length-2)) {
									case RBRACE: stack = empty
								}
								break
							default:
								switch (stack.charCodeAt(size-2)) {
									case LBRACE: stack = empty
								}
						}
					}

					output += stack;
					operation = 0
					stack = empty
				}

				// reset
				pseudo = 0
				globals = 0
				join = 0
				format = 0
				frame = empty
			} else {
				// stack frame by frame
				switch (code) {
					case NEWLINE:
					case CARRIAGE: {
						// linter plugin
						if (plugged > 0 && unknctx > 0 && com === 0 && (unknown = unknown.trim()).length > 0) {
							switch (frame.length) {
								case 0:
									break
								default:
									switch (cache = plugin(UNKNCTX, unknown, line, cols, id, output.length)) {
										case null:
										case void 0:
											break
										default:
											frame = frame.replace(new RegExp(unknown.replace(pescape, '\\$&') + '$'), cache).trim()
									}
							}

							unknown = empty
						}

						// terminate line comment
						if (com === LINECOMMENT) {
							com = 0
						}

						// next line, reset column position
						cols = 0
						line++

						break
					}
					default: {
						// increment column position
						cols++

						// ignore tabs
						if (code === TAB) {
							break
						}

						char = input.charAt(caret)

						// remove comments, escade functions, strings, attributes and prepare selectors
						switch (code) {
							// identify :global( pattern
							case GLOBAL: if (str + com + attr === 0 && caret - pseudo === 1) pseudo++; break;
							case COLON: if (str + com + attr === 0) pseudo = caret; break

							// selectors
							case COMMA: if (com + fun + str + attr === 0) join = 1, char += newline; break

							// strings
							case DQUOTE: if (com === 0) str = str === DQUOTE ? 0 : (str === 0 ? DQUOTE : str); break
							case SQUOTE: if (com === 0) str = str === SQUOTE ? 0 : (str === 0 ? SQUOTE : str); break

							// attributes
							case LBRACKET: if (str + com + fun === 0) attr = 1; break
							case RBRACKET: if (str + com + fun === 0) attr = 0; break

							// functions
							case RPAREN: if (str + com + attr === 0) fun = 0; break
							case LPAREN: if (str + com + attr === 0) fun = pseudo - (caret-6) === 0 ? (count = 0, globals = 1) : 1; break

							// comments line/block
							case FSLASH: if (com === BLOCKCOMMENT) break
							case STAR: {
								// break if in line comment or escape sequence
								if (str + attr + fun !== 0 || com === LINECOMMENT) {
									break
								}

								char = empty

								switch (input.charCodeAt(caret+1)) {
									case FSLASH: com = code === FSLASH ? LINECOMMENT : 0; break
									case STAR: com = code === FSLASH ? BLOCKCOMMENT : com; break
								}

								break
							}
						}

						// ignore comment blocks
						if (com === 0) {
							// aggressive isolation mode, divide each individual selector
							// including selectors in :not function but excluding selectors in :global function
							if (cascade + str + attr === 0) {
								switch ((format = 1, code)) {
									case ID:
									case CLASS:
									case SIBLING:
									case CHILD:
									case ADJACENT:
									case RPAREN:
									case LPAREN:
										if (globals === 0) {
											char = tail === SPACE ? char + carriage : carriage + char + carriage;
										} else {
											switch (code) {
												case LPAREN: globals = ++count; break
												case RPAREN: if ((globals = --count) === 0) char += carriage; break
											}
										}
										break
									case SPACE:
										if (globals === 0 && tail !== SPACE) {
											char += carriage;
										}
										break
								}
							}

							frame += char
						} else if (plugged > 0 && unknctx > 0) {
							// linter plugin
							unknown += char
						}
					}
				}
			}

			tail = code
			caret++
		}

		if (recurse === 0) {
			// plugin, post context
			if (plugged > 0) {
				if (postctx > 0) {
					switch (cache = plugin(POSTCTX, output, line, cols, id, output.length)) {
						case null:
						case void 0:
							break
						default:
							output = cache
					}
				}

				if (unknctx > 0) {
					unknown = empty
				}
			}

			if (compress === 1) {
				output = minify(output)
			}
		}

		return operation === 1 ? output : output.replace(pcarriage, empty)
	}

	/**
	 * Nest
	 *
	 * @param {Array<String>} parents
	 * @param {Array<String>} current
	 * @param {Number} length
	 * @param {Number} size
	 * @return {Array<String>}
	 */
	function nest (parents, rules, length, size) {
		for (var i = 0, index = 0, selectors = []; i < length; i++) {
			for (var j = 0; j < size; j++) {
				var parent = parents[j]
				var rule = rules[i]

				if (cascade === 0) {
					switch (parent.charCodeAt(0)) {
						case ID:
						case CLASS:
						case SIBLING:
						case CHILD:
						case ADJACENT:
						case ATTRIBUTE:
							break
						default:
							rule = rule.replace(ppatch, capture+parent.replace(ptype, empty))
					}
				}

				selectors[index++] = rule.replace(punique, parent)
			}
		}

		return selectors
	}

	/**
	 * Proxy
	 *
	 * @param {Number} context
	 * @param {String} input
	 * @param {Number} line
	 * @param {Number} cols
	 * @param {String} id
	 * @param {Number} length
	 * @return {String?|void}
	 */
	function proxy (context, input, line, cols, id, length) {
		for (var i = 0, output = input; i < plugged; i++) {
			output = plugins[i](context, output, line, cols, id, length) || output
		}

		if (output !== input) {
			return output
		}
	}

	/**
	 * Minify
	 *
	 * @param {String} output
	 * @return {String}
	 */
	function minify (output) {
		// remove spaces before `}=:` characters,
		// spaces after `{];=:` characters,
		// trailing `;` character
		return output
			.replace(pminifybefore, empty)
			.replace(pminifyafter, capture)
			.replace(pminifytail, capture)
	}

	/**
	 * Use
	 *
	 * @param {Array<Function>|Function} plugin
	 */
	function use (plugin) {
		switch (plugin) {
			case void 0: break;
			case null:
				plugged = plugins.length = 0;
				break
			default:
				switch (plugin.constructor) {
					case Array:
						for (var i = 0, l = plugin.length; i < l; i++) {
							use(plugin[i++])
						}
						break
					default: plugins[plugged++] = plugin
				}
		}
	}

	/**
	 * Set
	 *
	 * @param {Object?} options
	 */
	function set (options) {
		for (var name in options) {
			var value = options[name]
			switch (name) {
				case keyframes: scope = value|0; break
				case 'global': global = value|0; break
				case 'cascade': cascade = !!value|0; break
				case 'compress': compress = value|0; break
				case 'prefix': prefix = value|0; break
				case 'plugins': use(value); break
				case 'context':
					for (var i = 0, condition; i < value.length; i++)
						switch (condition = value[i]) {
							case PREPCTX: prepctx = condition|0; break
							case SELECTX: selectx = condition|0; break
							case RULECTX: rulectx = condition|0; break
							case PROPCTX: propctx = condition|0; break
							case BLCKCTX: blckctx = condition|0; break
							case POSTCTX: postctx = condition|0; break
						}
					break
			}
		}
	}

	compile.use = use
	compile.set = set

	return compile
}))
