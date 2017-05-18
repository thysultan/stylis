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

	var array = [empty]
	var plugins = []

	var pand = /&/g /* finds all & characters */
	var pnewline = /\n/g /* finds newlines */
	var psplit = /,\n/g /* splits selectors */
	var pplace = /::place/g /* asserts ::placeholder varient */
	var pcolon = /: */g /* splits animation rules into propert: declaration */
	var pscope = /[ .#~+>\d]+/g /* removes invalid characters in keyframe scoped name */
	var pprops = / +\s*(?![^(]*[)])/g
	var panimation = /,+\s*(?![^(]*[)])/g /* splits multiple animations in shorthand */
	var pkeys = /@keyframes\s+([^\s{]*)\s*/g /* findes the name of a keyframe */
	var pcursor = /zoo|gra/ /* asserts the cursor varient */
	var pescape = /[-\/\\^$*+?.()|[\]{}]/g /*	escapes regex when liniting */
	var pglobal = /:global\(%?((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g /* matches :global(..) */
	var pcascade = / +\s*(?![^([]*[)\]])/gm /* aggressive cascade mode */
	var ptransform = / +(transform)/g /* vendor transform for older webkit */
	var pminibefore = /\s*(?=[{\];=:](?!.*'))/g /* rm \s before characters outside of strings */
	var pminiafter = /([[}])\s*(?!.*')/g /* rm \s after characters outside of strings */

	/* settings */
	var vendor = 1
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
	var GREATER = 62

	var KEYFRAME = 107
	var MEDIA = 109
	var UNKNOWN = 256

	var PREPCTX = 0 /* preparation context signature */
	var SELECTX = 1 /* selector context signature */
	var RULECTX = 2 /* rule context signature */
	var PROPCTX = 3 /* property context signature */
	var FLATCTX = 4 /* flat context signature */
	var BLCKCTX = 5 /* block context signature */
	var POSTCTX = 6 /* post-process context signature */

	var prepctx = 1 /* on/off preparation context */
	var selectx = 1 /* on/off selector context */
	var rulectx = 1 /* on/off rule context */
	var propctx = 1 /* on/off property context */
	var flatctx = 1 /* on/off flat context */
	var blckctx = 1 /* on/off block context */
	var postctx = 1 /* on/off post-process context */

	/**
	 * Compiler
	 *
	 * @param {String} identity
	 * @param {String} input
	 * @return {String}
	 */
	function compiler (identity, input) {
		var id = identity + empty
		var eof = input.length
		var eol = eof - 1

		var line = 1
		var caret = 0
		var depth = 0
		var cols = 0

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

		code = id.charCodeAt(0)

		if ((code = id.charCodeAt(0)) < 33)
			code = (id = id.trim()).charCodeAt(0)

		if (scope === 1) {
			switch (code) {
				// id/class
				case DOT: case HASH: key = id.substring(1); break
				case LBRACKET:
					// `[data-id=id]` -> ['data-id', 'id']
					properties = id.substring(1, id.length - 1).split('=')
					size = properties.length
					key = key = size > 1 ? properties[1] : properties[0]

					// [data-id="id"]/[data-id='id'] --> "id"/'id' --> id
					switch (key.charCodeAt(0)) {
						case DQUOTE: case SQUOTE: key = key.substring(1, key.length-1)
					}

					id = '['+ properties[0] + (size > 1 ? ('=' + key +']') : ']')
					break
				default: key = id
			}

			var key = key.replace(pscope, '-')
		}

		// plugin, pre context
		if (plugged > 0 && propctx > 0) {
			var plugin = plugged > 1 ? proxy : plugins[0]

			if (recurse === 0)
				switch (cache = plugin(PREPCTX, input, line, cols, id, 0)) {
					case null: case void 0: break; default: input = cache
				}
		}

		while (caret < eof) {
			var code = input.charCodeAt(caret)
			var skip = com + fun + str + attr

			switch (code) {
				case SEMICOLON: if (caret === eol) flat = frame, flatten = 1, code = 0
				case LBRACE: case RBRACE: token = 1; break
				default: token = caret === eol ? 1 : 0
			}

			if (skip === 0 && token === 1) {
				if (flatten === 1 && code !== SEMICOLON) {
					// plugin, flat context
					if (plugged > 0 && flatctx > 0)
						switch (cache = plugin(FLATCTX, flat, line, cols, id, output.length)) {
							case null: case void 0: break; default: flat = cache
						}

					output += id+lbraces+flat+rbraces
					flatten = 0
					flat = empty
				}

				frame += (char = input.charAt(caret))
				cols++

				if (plugged > 0 && code !== RBRACE && operation === 0) {
					if (selectx > 0 && code === LBRACE)
						// plugin selector context
						cache = plugin(SELECTX, frame.substring(0, frame.length-1).trim(), line, cols, id, output.length)
					else if (propctx > 0)
						// plugin property context
						cache = plugin(PROPCTX, frame, line, column, id, output.length)

					if (propctx + selectx > 0)
						switch (cache) {
							case null: case void 0: break; default: frame = code === LBRACE ? cache+space+lbraces : cache
						}
				}

				if ((first = frame.charCodeAt(0)) === SPACE)
					first = (frame = frame.trim()).charCodeAt(0)

				second = frame.charCodeAt(1)
				third = frame.charCodeAt(2)
				size = frame.length

				if (first === AT)
					switch (second) {
						case KEYFRAME: operation = KEYFRAME; break
						case MEDIA: operation = MEDIA;
						default: depth++
					}

				if (code === LBRACE) {
					if ((depth++, operation !== KEYFRAME)) {
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

								if (count === 0)
									break

								body += input.charAt(caret++)
							}

							switch (first) {
								case AT: body = body.trim(); break
								default: body = frame + body.trim() + rbraces
							}

							if (operation === MEDIA)
								block += frame, code = RBRACE, previous[0] = id

							for (recurse = 1, i = 0, length = previous.length; i < length; i++) {
								if (cascade === 1)
									current = previous[i]
								else
									current = id, namespace = previous[i], namescope = 1

								block += compiler(current, body).trim()
							}

							if (cascade === 0)
								namescope = 0

							recurse = 0
							nested = 1
							frame = empty
						} else if (operation === 0) {
							// :placeholder
							if (place === 0 && frame.indexOf(colon+colon+'place') !== -1)
								place = 1

							selectors = frame.substring(0, size-1).trim().split(psplit)
							length = selectors.length

							if (cascade === 0)
								previous = new Array(length)

							for (i = 0; i < length; i++) {
								if ((tail = (current = selectors[i]).charCodeAt(0)) === SPACE)
									tail = (current = current.trim()).charCodeAt(0)

								switch (tail) {
									case AND: current = id + current.substring(1).replace(pand, id); break
									default:
										if (tail === COLON) {
											switch (current.charCodeAt(1)) {
												case 103:
													if (globals > 0)
														current = current.replace(pglobal, capture).replace(pand, id).trim()
													break
												default: current = id + current
											}
										} else if (current.indexOf(space+'&') > 0) {
											// html &
											current = current.replace(pand, id).trim()
										} else {
											current = id + space + current
										}
								}

								// aggressive cascade isolation
								if (cascade === 0) {
									collection = current.split(pcascade)

									for (index = 0; index < collection.length; index++) {
										switch ((cache = collection[index]).charCodeAt(0)) {
											case GREATER: break;
											case COLON:
												switch (cache.charCodeAt(1)) {
													case 103: cache = cache.replace(pglobal, capture).replace(pand, id).trim(); break
													default: cache = id + cache
												}
												break
											default:
												if (cache.indexOf(id) < 0) {
													cache = cache.indexOf(colon) > -1 ? cache.replace(pcolon, id+colon) : cache + id
												} else {
													continue
												}
										}

										if (namescope === 1)
											cache = namespace.replace(id, empty).trim() + space + cache

										collection[index] = cache
									}

									current = collection.join(space)
									previous[i] = current
								}

								// plugin, selector context
								if (plugged > 0 && rulectx > 0)
									switch(cache = plugin(RULECTX, current, line, cols, id, output.length)) {
										case null: case void 0: break; default: selector = cache
									}

								selectors[i] = cascade === 1 ? current : current.replace(id, empty).trim()
							}

							if (cascade === 1)
								previous = selectors

							frame = selectors.join(comma) + lbraces
						}
					}
				} else if (RBRACE + 1 !== code + size) {
					if (join === 1)
						frame = frame.replace(pnewline, empty)

					// semicolon insertion
					if (code !== SEMICOLON)
						frame = (code === RBRACE ? frame.substring(0, size - 1) : frame).trim() + semi

					// animations
					if (first === 97 && second === 110 && third === 105) {
						// animation: a, n, i characters
						frame = frame.substring(0, size-1)
						index = frame.indexOf(colon)+1
						cache = frame.substring(0, index)
						body = frame.substring(index).trim()

						// shorthand
						if (frame.charCodeAt(9) !== DASH) {
							length = (collection = body.split(panimation))

							for (i = 0; i < length; index = 0, i++) {
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
													case 'initial': case 'unset': case 'step-start': case 'step-end': break
													default: current += key
												}
											}
										}
									}

									properties[index++] = current
								}

								cache += (i === 0 ? empty : comma) + properties.join(space)
							}
						} else {
							cache += frame.charCodeAt(10) !== 110 ? empty : ns + body
						}

						cache += semi
						frame = vendor === 1 ? webkit + cache + cache : cache
						if (code === RBRACE) frame += rbraces
					} else if (vendor === 1) {
						if (first === 97 && second === 112 && third === 112) {
							// appearance: a, p, p
							frame = webkit + frame + moz + frame + frame
						} else if (first === 100 && second === 105 && third === 115) {
							// display: d, i, s
							// flex/inline-flex
							if ((index = frame.indexOf(flex)) !== -1) {
								// e, inline-flex
								cache = frame.charCodeAt(index-2) === 101 ? 'inline-' : empty
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
							frame = webkit + frame + ms + flex+ '-' + frame + frame
						} else if (first === 97 && second === 108 && third === 105 && frame.charCodeAt(5) === DASH) {
							// align-items, align-center, align-self: a, l, i, -
							switch (frame.charCodeAt(6)) {
								// align-items, i
								case 105:
									cache = frame.replace('-items', empty)
									frame = webkit + frame + webkit + box + '-' + cache + ms + flex + '-' + cache + frame
									break
								// align-self, s
								case 115: frame = ms + flex + '-item-' + frame.replace('-self', empty) + frame; break
								// align-content
								default: frame = ms + flex+'-line-pack' + frame.replace('align-content', empty) + frame; break
							}
						} else if (first === 106 && second === 117 && third === 115) {
							// justify-content, j, u, s
							index = frame.indexOf(colon)
							cache = frame.substring(index).replace(flex + '-', empty)
							frame = webkit + box + '-pack' + cache + webkit + frame + ms + flex + '-pack' + cache + frame
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
						flatten = 1
						flat += frame
						frame = empty
						caret++
						continue
					}
				}

				stack += frame

				// end of block
				if (code === RBRACE) {
					if (previous !== array)
						previous = array

					if (depth > 0)
						depth--

					if (place === 1) {
						// :placeholder
						place = 0
						stack = (stack.replace(pplace, colon+colon+webkit+'input-place') +
							stack.replace(pplace, colon+colon+moz+'place') +
							stack.replace(pplace, colon+ms+'input-place') + stack)
					} else if (scope === 1 && operation === KEYFRAME) {
						stack = keyframes + space + stack.replace(pkeys, key+'-'+capture).trim()

						switch (vendor) {
							case 1: stack = '@' + webkit + stack + rbraces + '@' + stack
						}
					} else if (nested === 1) {
						switch (operation) {
							case MEDIA:
								switch (size = stack.length) {
									case 0: stack = block + rbraces; break
									default: stack = stack.charCodeAt(size-1) === LBRACE ? block : stack + rbraces + block
								}
								break;
							default: {
								switch (stack.charCodeAt(stack.length-2)) {
									case LBRACE: stack = empty
									default: stack += block
								}
							}
						}

						block = empty
						nested = 0
					}

					// plugin, block context
					if (plugged > 0 && blckctx > 0)
						switch (cache = plugin(BLCKCTX, stack, line, cols, id, output.length)) {
							case null: case void 0: break; default: stack = cache
						}

					operation = 0
					output += stack
					stack = empty
				}

				join = 0
				frame = empty
			} else {
				// stack frame by frame
				switch (code) {
					case NEWLINE:
					case CARRIAGE:
						if (plugged > 0 && com === 0 && (unknown = unknown.trim()).length > 0) {
							switch (frame.length) {
								case 0: break
								default: switch(cache = plugin(7, unknown, line, cols, id, output.length)) {
									case null: case void 0: break;
									default:
										frame = frame.replace(new RegExp(unknown.replace(pescape, '\\$&')+'$'), cache).trim()
								}
							}

							unknown = empty
						}

						if (com === LINECOMMENT)
							com = 0

						cols = 0
						line++

						break
					default:
						cols++

						if (code === TAB)
							break

						char = input.charAt(caret)

						switch (code) {
							case COMMA: if (com + fun + str + attr === 0) join = 1, char += '\n'; break
							case DQUOTE: if (com === 0) str = str === DQUOTE ? 0 : str === SQUOTE ? SQUOTE : DQUOTE; break
							case SQUOTE: if (com === 0) str = str === DQUOTE ? 0 : str === SQUOTE ? SQUOTE : DQUOTE; break
							case LPAREN: if (str + com + attr === 0) fun = 1; break
							case RPAREN: if (str + com + attr === 0) fun = 0; break
							case LBRACKET: if (str + com + fun === 0) attr = 1; break
							case RBRACKET: if (str + com + fun === 0) attr = 0; break
							case STAR:
							case FSLASH:
								if (fun + str + attr !== 0 || com === LINECOMMENT)
									break

								char = empty

								switch (input.charCodeAt(caret+1)) {
									case FSLASH: com = code === FSLASH ? LINECOMMENT : 0; break
									case STAR: com = code === FSLASH ? BLOCKCOMMENT : com; break
								}
								break
						}

						if (com === 0)
							frame += char
						else if (plugged > 0)
							unknown += char
				}
			}

			caret++
		}

		if (recurse === 0) {
			// plugin, post context
			if (plugged > 0) {
				if (postctx > 0)
					switch (cache = plugin(POSTCTX, output, line, cols, id, output.length)) {
						case null: case void 0: break; default: output = cache
					}

				unknown = empty
			}

			if (compress === 1)
				output = minify(output)
		}

		return output
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
		for (var i = 0, output = input; i < plugged; i++)
			output = plugins[i](context, output, line, cols, id, length) || output

		if (output !== input)
			return output
	}

	/**
	 * Use
	 *
	 * @param {Array<Function>|Function} plugin
	 */
	function use (plugin) {
		switch (plugin) {
			case null: plugged = plugins.length = 0; break
			default:
				switch (plugin.constructor) {
					case Array:
						for (var i = 0, l = plugins.length; i < l; i++)
							use(plugins[i++]); break
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
				case 'prefix': prefix(value); break
				case 'context':
					for (var i = 0; i < value.length; i++)
						context(value[i], 1)
					break
			}
		}
	}

	/**
	 * Minify
	 *
	 * @param {String} output
	 * @return {String}
	 */
	function minify (output) {
		// remove spaces before, spaces after
		return output.replace(pminibefore, empty).replace(pminiafter, capture);
	}

	/**
	 * Context
	 *
	 * @param  {Number} code
	 * @param  {Boolean} condition
	 */
	function context (code, condition) {
		switch (code) {
			case PREPCTX: flatctx = condition|0; break
			case SELECTX: selectx = condition|0; break
			case RULECTX: rulectx = condition|0; break
			case PROPCTX: propctx = condition|0; break
			case FLATCTX: flatctx = condition|0; break
			case BLCKCTX: blckctx = condition|0; break
			case POSTCTX: postctx = condition|0; break
		}
	}

	/**
	 * Prefix
	 *
	 * @param {Boolean?} condition
	 */
	function prefix (condition) {
		vendor = condition|0
	}

	compiler.use = use
	compiler.set = set
	compiler.context = context
	compiler.prefix = prefix

	return compiler
}))
