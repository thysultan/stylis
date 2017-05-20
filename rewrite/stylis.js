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
	typeof exports === 'object' && typeof module !== 'undefined' ? (module.exports = factory(global)) :
		typeof define === 'function' && define.amd ? define(factory(window)) :
			(window.stylis = factory(window))
}(function (window) {

	'use strict'

	/* reusable string varients */
	var empty = ''
	var space = ' '
	var comma = ','
	var rbraces = '}'
	var lbraces = '{'
	var colon = ':'
	var semi = ';'
	var formfeed = '\f'
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
	var unknown = empty
	var unique = '%%'

	var array = [empty]
	var plugins = []

	var pformfeed = /\f/g /* match form feed characters */
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
	var pformat = /(['"`]).*?\1|\s+=\s*|\s*=\s+/g
	var punique = /%%/g
	var ppatch = /([^[#.>~+\s])%%/g
	var ptype = /^[^[#.>~+\s]+/

	/* settings */
	var prefix = 1
	var scope = 1
	var cascade = 1
	var globals = 1
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
	 * @param {String} select
	 * @param {String} input
	 * @return {String}
	 */
	function compile (select, input) {
		var sel = select
		var hash = select
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

		switch (select.constructor) {
			case Number: sel += empty
				break
			case Array:
				sel = select.join(empty)

				if ((type = select.length) > 1 || cascade === 0) {
					hash = unique
				} else {
					hash = sel
				}

				break
		}

		if ((code = sel.charCodeAt(0)) < 33) {
			code = (sel = sel.trim()).charCodeAt(0)
			hash = hash.trim()
		}

		if (scope === 1) {
			switch (code) {
				// id/class
				case DOT: case HASH: key = sel.substring(1); break
				case LBRACKET:
					// `[data-id=$]` -> ['data-id', '$']
					properties = sel.substring(1, sel.length - 1).split('=')
					size = properties.length
					key = key = size > 1 ? properties[1] : properties[0]

					// [data-id="$"]/[data-id='$'] --> "$"/'$' --> $
					switch (key.charCodeAt(0)) {
						case DQUOTE: case SQUOTE: key = key.substring(1, key.length-1)
					}

					sel = '['+ properties[0] + (size > 1 ? ('=' + key +']') : ']')
					break
				default: key = sel
			}

			var key = key.replace(pscope, dash)
		}

		// plugin, pre context
		if (plugged > 0 && propctx > 0) {
			var plugin = plugged > 1 ? proxy : plugins[0]

			if (recurse === 0) {
				switch (cache = plugin(PREPCTX, input, line, cols, hash, 0)) {
					case null:
					case void 0: break;
					default:
						eol = (input = cache).length
						eof = eol + 1
				}
			}
		}

		main: while (caret < eof) {
			var code = input.charCodeAt(caret)
			var skip = com + fun + str + attr

			switch (code) {
				case SEMICOLON:
					if (caret === eol) {
						flatten = 1
						code = SEMICOLON
					}
				case LBRACE:
				case RBRACE:
					token = 1;
					break
				default:
					if (caret === eol) {
						token = 1
					} else {
						token = 0
					}
			}

			if (skip === 0 && token === 1) {
				frame += (char = input.charAt(caret))
				cols++

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
						cache = plugin(SELECTX, frame.substring(0, frame.length-1).trim(), line, cols, hash, output.length)
					} else if (propctx > 0) {
						// plugin property context
						cache = plugin(PROPCTX, frame, line, cols, hash, output.length)
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

				size = frame.length

				if (size > 0) {
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
												body = frame + body.trim() + rbraces
										}

										switch (operation) {
											case BLOCK:
												code = RBRACE
												block += frame

												if (previous === array && previous[0].length === 0) {
													switch (type) {
														case 0: previous[0] = hash; break
														case 1: previous[0] = hash[0]; break
													}
												}
										}

										if (cascade === 0) {
											namescope = 1
											namespace = unique
										}

										block += compile(previous, body).trim()

										if (cascade === 0) {
											namescope = 0
											namespace = empty
										}

										recurse = 0
										nested = 1
										frame = empty
									} else if (operation === 0) {
										// :placeholder
										if (place === 0 && frame.indexOf(colon+colon+'place') !== -1) {
											place = 1
										}

										selectors = frame.substring(0, size-1).trim().split(psplit)
										length = selectors.length

										for (i = 0; i < length; i++) {
											if ((tail = (current = selectors[i]).charCodeAt(0)) === SPACE) {
												tail = (current = current.trim()).charCodeAt(0)
											}

											switch (cascade) {
												case 1: {
													switch (tail) {
														case AND:
															current = hash + current.substring(1).replace(pand, hash);
															break
														default:
															if (tail === COLON) {
																switch (current.charCodeAt(1)) {
																	case 103:
																		if (globals > 0) {
																			current = current.replace(pglobal, capture).replace(pand, hash).trim()
																		}
																		break
																	default:
																		current = hash + current
																}
															} else if (current.indexOf(space+'&') > 0) {
																// html &
																current = current.replace(pand, hash).trim()
															} else {
																current = hash + space + current
															}
													}
													break
												}
												case 0: {
													// aggressive cascade isolation
													current = current.replace(pformat, format).replace(pglobal, format)
													collection = current.split(space)

													for (index = 0, size = collection.length; index < size; index++) {
														cache = collection[index]

														switch (cache.charCodeAt(0)) {
															// :
															case COLON:
																switch (cache.charCodeAt(1)) {
																	// :global
																	case 103:
																		cache = cache.replace(pglobal, capture).replace(pand, hash).replace(pformfeed, space)
																		break
																	// :pseudo
																	default:
																		cache = hash + cache
																}
																break
															// [
															case ATTRIBUTE:
																cache = cache.replace(pformfeed, space) + hash
																break
															// >, +, ~, ., #
															case ID:
															case CLASS:
															case SIBLING:
															case CHILD:
															case ADJACENT:
																if (cache.length === 1) {
																	continue
																}
															default:
																switch (cache.indexOf(colon)) {
																	// selector
																	case -1:
																		switch (cache.charCodeAt(cache.length-1)) {
																			// selector)
																			case RPAREN:
																				if (cache.length > 1) {
																					cache = cache.substring(0, cache.length-1) + hash + ')'
																				}
																				break
																			default:
																				cache += hash
																		}
																		break
																	// selector:pseudo
																	default:
																		cache = cache.replace(ppseudo, hash + capture)
																}
														}

														// console.log(0, cache, cache[cache.length-1]);

														// nested
														if (namescope === 1) {
															cache = namespace + space + cache
														}

														collection[index] = cache
													}

													selectors[i] = current = collection.join(space)
												}
											}

											// plugin, selector context
											if (plugged > 0 && rulectx > 0) {
												switch (cache = plugin(RULECTX, current, line, cols, hash, output.length)) {
													case null:
													case void 0:
														break
													default:
														current = cache
												}
											}

											if (cascade === 1) {
												selectors[i] = current
											}
										}

										previous = selectors

										if (type > 0) {
											selectors = nest(select, selectors, length, type)
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
												(peak > AT && peak < 90) || (peak > 96 && peak < 122) ||
												// exceptions `_, -`
												peak === DASH ||
												// unless there are two in sequence
												peak === 95 && current.charCodeAt(1) !== 95
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
								if (first === 97 && second === 112 && third === 112) {
									// appearance: a, p, p
									frame = webkit + frame + moz + frame + frame
								} else if (first === 100 && second === 105 && third === 115) {
									// display: d, i, s
									// flex/inline-flex
									if ((index = frame.indexOf(flex)) !== -1) {
										// e, inline-flex
										cache = frame.charCodeAt(index-2) === 101 ? 'inline'+dash : empty
										frame = frame.indexOf(important) !== -1 ? important : empty
										frame = (
											display + webkit + cache + box + frame + semi +
											display + webkit + cache + flex + frame + semi +
											display + ms + flex + box + frame + semi +
											display + cache + flex + frame + semi
										)
									}
								} else if (first === 116 && ((second === 114 && third === 97) || (second === 101 && third === 120))) {
									// transform, transition: t, r, a
									// text-size-adjust: t, e, x
									frame = webkit + frame + (frame.charCodeAt(5) === 102 ? ms + frame : empty) + frame
									// transitions
									if (second + third === 211 && frame.charCodeAt(12) === 115 && frame.indexOf(space+'transform') > -1)
										frame = frame.substring(0, frame.indexOf(semi)+1).replace(ptransform, webkit+capture) + frame
								} else if ((first === 104 && second === 121 && third === 112) ||
									(first === 117 && second === 115 && third === 101)) {
									// hyphens: h, y, p
									// user-select: u, s, e
									frame = webkit + frame + moz + frame + ms + frame + frame
								} else if (first === 102 && second === 108 && third === 101) {
									// flex: f, l, e
									frame = webkit + frame + ms + frame + frame
								} else if (first === 111 && second === 114 && third === 100) {
									// order: o, r, d
									frame = webkit + frame + ms + flex+ dash + frame + frame
								} else if (first === 97 && second === 108 && third === 105 && frame.charCodeAt(5) === DASH) {
									// align-items, align-center, align-self: a, l, i, -
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
								} else if (first === 106 && second === 117 && third === 115) {
									// justify-content, j, u, s
									index = frame.indexOf(colon)
									cache = frame.substring(index).replace(flex + dash, empty)
									frame = webkit + box + dash + 'pack' + cache + webkit + frame + ms + flex + dash + 'pack' + cache + frame
								} else if (first === 99 && second === 117 && third === 114 && pcursor.exec(frame) !== null) {
									// cursor, c, u, r
									frame = frame.replace(pcolon, colon+space+webkit) + frame.replace(pcolon, colon+space+moz) + frame
								} else if (first === 119 && second === 105 && third === 100 && (index = frame.indexOf(cont)) !== -1) {
									// width: min-content / width: max-content
									cache = frame.substring(index - 3)
									frame = width + webkit + cache + width + moz + cache + width + cache
								}
							}

							// semicolon insertion
							if (code !== SEMICOLON) {
								frame = frame.substring(0, (size = frame.length) - 1)

								if (code === RBRACE)
									frame += rbraces
							}

							// flat context
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

				if (flatten === 1 && code !== SEMICOLON) {
					if (caret === eol) {
						flat += frame
						frame = empty
					}

					if (type > 1) {
						flat = nest(select, [hash], 1, type).join(comma) + lbraces + flat + rbraces
					} else {
						flat = hash + lbraces + flat + rbraces
					}

					// plugin, block context
					if (plugged > 0 && blckctx > 0) {
						switch (cache = plugin(BLCKCTX, flat, line, cols, hash, output.length)) {
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

				// end of block
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
						switch (cache = plugin(BLCKCTX, stack, line, cols, hash, output.length)) {
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

				join = 0
				frame = empty
			} else {
				// stack frame by frame
				switch (code) {
					case NEWLINE:
					case CARRIAGE: {
						if (plugged > 0 && unknctx > 0 && com === 0 && (unknown = unknown.trim()).length > 0) {
							switch (frame.length) {
								case 0:
									break
								default:
									switch (cache = plugin(UNKNCTX, unknown, line, cols, hash, output.length)) {
										case null:
										case void 0:
											break
										default:
											frame = frame.replace(new RegExp(unknown.replace(pescape, '\\$&') + '$'), cache).trim()
									}
							}

							unknown = empty
						}

						if (com === LINECOMMENT) {
							com = 0
						}

						cols = 0
						line++

						break
					}
					default: {
						cols++

						if (code === TAB) {
							break
						}

						char = input.charAt(caret)

						switch (code) {
							case COMMA: if (com + fun + str + attr === 0) join = 1, char += '\n'; break
							case DQUOTE: if (com === 0) str = str === DQUOTE ? 0 : (str === 0 ? DQUOTE : str); break
							case SQUOTE: if (com === 0) str = str === SQUOTE ? 0 : (str === 0 ? SQUOTE : str); break
							case LPAREN: if (str + com + attr === 0) fun = 1; break
							case RPAREN: if (str + com + attr === 0) fun = 0; break
							case LBRACKET: if (str + com + fun === 0) attr = 1; break
							case RBRACKET: if (str + com + fun === 0) attr = 0; break
							case FSLASH:
								if (com === BLOCKCOMMENT) {
									break
								}
							case STAR: {
								if (fun + str + attr !== 0 || com === LINECOMMENT) {
									break
								}

								char = empty

								switch (input.charCodeAt(caret+1)) {
									case FSLASH:
										com = code === FSLASH ? LINECOMMENT : 0;
										break
									case STAR:
										com = code === FSLASH ? BLOCKCOMMENT : com;
										break
								}

								break
							}
						}

						if (com === 0) {
							frame += char
						} else if (plugged > 0) {
							unknown += char
						}
					}
				}
			}

			caret++
		}

		if (recurse === 0) {
			// plugin, post context
			if (plugged > 0) {
				if (postctx > 0) {
					switch (cache = plugin(POSTCTX, output, line, cols, hash, output.length)) {
						case null:
						case void 0:
							break
						default:
							output = cache
					}
				}

				unknown = empty
			}

			if (compress === 1) {
				output = minify(output)
			}
		}

		return output
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
		for (var i = 0, idx = 0, selectors = []; i < length; i++) {
			for (var index = 0; index < size; index++) {
				var parent = parents[index]
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
							rule = rule.replace(ppatch, '$1'+parent.replace(ptype, empty))
					}
				}

				selectors[idx++] = rule.replace(punique, parent)
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
	 * @param {String} hash
	 * @param {Number} length
	 * @return {String?|void}
	 */
	function proxy (context, input, line, cols, hash, length) {
		for (var i = 0, output = input; i < plugged; i++) {
			output = plugins[i](context, output, line, cols, hash, length) || output
		}

		if (output !== input) {
			return output
		}
	}

	/**
	 * Format
	 *
	 * @param {String} match
	 * @return {String}
	 */
	function format (match) {
		return match.replace(pspace, formfeed)
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
				case 'global': globals = value|0; break
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
