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

	var array = ['']
	var plugins = []
	var plugged = 0

	var pand = /&/g
	var psplit = /,\n/g
	var pline = /\n/g
	var pplace = /::place/g
	var pcolon = /: */g
	var pscope = /[ .#~+>\d]+/g
	var pprops = / +\s*(?![^(]*[)])/g
	var panims = /,+\s*(?![^(]*[)])/g
	var pkeys = /@keyframes\s+([^\s{]*)\s*/g
	var pcursor = /zoo|gra/
	var pescape = /[-\/\\^$*+?.()|[\]{}]/g
	var ppseudo = /(:[\w-]+)[\S]+/g
	var pglobal = /:global\(%?((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g
	var plock = / +\s*(?![^([]*[)\]])/gm

	var webkit = '-webkit-'
	var moz = '-moz-'
	var ms = '-ms-'
	var cont = '-content'
	var important = ' !important'
	var display = 'display:'
	var flex = 'flex'
	var box = 'box'
	var width = 'width:'
	var keyframes = 'keyframes'
	var semi = ';'
	var unknown = ''
	var vendor = 1
	var scope = 1
	var cascade = 1

	var glob = 1

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

	var namescope = 0
	var namespace = ''

	/**
	 * Compiler
	 *
	 * @param {String} identifier
	 * @param {String} input
	 * @return {String}
	 */
	function compiler (identifier, input) {
		var id = identifier+''
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
		var colon = 0
		var i = 0
		var length = 0
		var tail = 0

		var current = ''
		var output = ''
		var char = ''
		var frame = ''
		var cache = ''
		var stack = ''
		var body = ''
		var flat = ''
		var block = ''
		var key = ''

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
		if (plugged > 0) {
			var plugin = plugged > 1 ? proxy : plugins[0]

			switch (cache = plugin(0, input, line, cols, id, 0)) {
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
					if (plugged > 0)
						switch (cache = plugin(4, flat, line, cols, id, output.length)) {
							case null: case void 0: break; default: flat = cache
						}

					output += id+'{'+flat+'}'
					flatten = 0
					flat = ''
				}

				frame += (char = input.charAt(caret))
				cols++

				if (plugged > 0 && code !== RBRACE) {
					// plugin, selector/property context
					if (code === LBRACE)
						cache = plugin(1, frame.substring(0, frame.length-1).trim(), line, cols, id, output.length)
					else
						cache = plugin(2, frame, line, column, id, output.length)

					switch (cache) {
						case null: case void 0: break; default: frame = code === LBRACE ? cache + ' {' : cache
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
							body = ''

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
								default: body = frame + body.trim() + '}'
							}

							if (operation === MEDIA)
								block += frame, code = RBRACE, previous[0] = id

							for (i = 0, length = previous.length; i < length; i++) {
								if (cascade === 1)
									current = previous[i]
								else
									current = id, namespace = previous[i], namescope = 1

								block += compiler(current, body).trim()
							}

							if (cascade === 0)
								namescope = 0

							nested = 1
							frame = ''
						} else if (operation === 0) {
							// :placeholder
							if (place === 0 && frame.indexOf('::place') !== -1)
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
													if (glob > 0)
														current = current.replace(pglobal, '$1').replace(pand, id).trim()
													break
												default: current = id + current
											}
										} else if (current.indexOf(' &') > 0) {
											// html &
											current = current.replace(pand, id).trim()
										} else {
											current = id + ' ' + current
										}
								}

								// aggressive cascade isolation
								if (cascade === 0) {
									collection = current.split(plock)

									for (index = 0; index < collection.length; index++) {
										switch ((cache = collection[index]).charCodeAt(0)) {
											case GREATER: break;
											case COLON:
												switch (cache.charCodeAt(1)) {
													case 103: cache = cache.replace(pglobal, '$1').replace(pand, id).trim(); break
													default: cache = id + cache
												}
												break
											default:
												if (cache.indexOf(id) < 0) {
													cache = cache.indexOf(':') > -1 ? cache.replace(pcolon, id+':') : cache + id
												} else {
													continue
												}
										}

										if (namescope === 1)
											cache = namespace.replace(id, '').trim() + ' ' + cache

										collection[index] = cache
									}

									current = collection.join(' ')
									previous[i] = current
								}

								// plugin, selector context
								if (plugged > 0)
									switch(cache = plugin(1.5, current, line, cols, id, output.length)) {
										case null: case void 0: break; default: selector = cache
									}

								selectors[i] = cascade === 1 ? current : current.replace(id, '').trim()
							}

							if (cascade === 1)
								previous = selectors

							frame = selectors.join(',') + '{'
						}
					}
				} else if (RBRACE + 1 !== code + size) {
					// semicolon insertion
					if (code !== SEMICOLON)
						frame = (code === RBRACE ? frame.substring(0, size - 1) : frame).trim() + semi

					// animations
					if (first === 97 && second === 110 && third === 105) {
						// animation: a, n, i characters
						frame = frame.substring(0, size-1)
						colon = frame.indexOf(':')+1
						cache = frame.substring(0, colon)
						body = frame.substring(colon).trim()

						// shorthand
						if (frame.charCodeAt(9) !== DASH) {
							length = (collection = body.split(panims))

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

								cache += (i === 0 ? '' : ',') + properties.join(' ')
							}
						} else {
							cache += frame.charCodeAt(10) !== 110 ? '' : ns + body
						}

						cache += semi
						frame = vendor === 1 ? webkit + cache + cache : cache
						if (code === RBRACE) frame += '}'
					} else if (vendor === 1) {
						if (first === 97 && second === 112 && third === 112) {
							// appearance: a, p, p
							frame = webkit + frame + moz + frame + frame
						} else if (first === 100 && second === 105 && third === 115) {
							// display: d, i, s
							// flex/inline-flex
							if ((index = frame.indexOf(flex)) !== -1) {
								// e, inline-flex
								cache = frame.charCodeAt(index-2) === 101 ? 'inline-' : ''
								frame = frame.indexOf(important) !== -1 ? important : ''
								frame = (
									display + webkit + cache + box + frame + semi +
									display + webkit + cache + flex + frame + semi +
									display + ms + flex + box + frame + semi +
									display + cache + flex + frame + semi
								)
							}
						} else if (first === 116 && ((second === 114 && third === 97) || (second === 101 && third === 120))) {
							// transforms, transitions: t, r, a
							// text-size-adjust: t, e, x
							frame = webkit + frame + (frame.charCodeAt(5) === 102 ? ms + frame : '') + frame
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
									cache = frame.replace('-items', '')
									frame = webkit + frame + webkit + box + '-' + cache + ms + flex + '-' + cache + frame
									break
								// align-self, s
								case 115: frame = ms + flex + '-item-' + frame.replace('-self', '') + frame; break
								// align-content
								default: frame = ms + flex+'-line-pack' + frame.replace('align-content', '') + frame; break
							}
						} else if (first === 106 && second === 117 && third === 115) {
							// justify-content, j, u, s
							colon = frame.indexOf(':')
							cache = frame.substring(colon).replace(flex + '-', '')
							frame = webkit + box + '-pack' + cache + webkit + frame + ms + flex + '-pack' + cache + frame
						} else if (first === 99 && second === 117 && third === 114 && pcursor.exec(frame) !== null) {
							// cursor, c, u, r
							frame = frame.replace(pcolon, ': ' + webkit) + frame.replace(pcolon, ': ' + moz) + frame
						} else if (first === 119 && second === 105 && third === 100 && (index = frame.indexOf(cont)) !== -1) {
							// width: min-content / width: max-content
							cache = frame.substring(index - 3)
							frame = width + webkit + cache + width + moz + cache + width + cache
						}
					}

					// semicolon insertion
					if (code !== SEMICOLON) {
						size = frame.length
						frame = frame.substring(0, size - 1)
						if (code === RBRACE){
							frame += '}'
						}
					}

					// flat context
					if (depth === 0 && code === SEMICOLON) {
						flatten = 1
						flat += frame
						frame = ''
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
						stack = (stack.replace(pplace, '::'+webkit+'input-place') +
							stack.replace(pplace, '::'+moz+'place') +
							stack.replace(pplace, ':'+ms+'input-place') + stack)
					} else if (scope === 1 && operation === KEYFRAME) {
						stack = keyframes + ' ' + stack.replace(pkeys, key+'-$1').trim()

						switch (vendor) {
							case 1: stack = '@' + webkit + stack + '}@' + stack
						}
					} else if (nested === 1) {
						switch (operation) {
							case MEDIA:
								switch (size = stack.length) {
									case 0: stack = block + '}'; break
									default: stack = stack.charCodeAt(size-1) === LBRACE ? block : stack + '}' + block
								}
								break;
							default: {
								switch (stack.charCodeAt(stack.length-2)) {
									case LBRACE: stack = ''
									default: stack += block
								}
							}
						}

						block = ''
						nested = 0
					}

					// plugin, block context
					if (plugged > 0)
						switch (cache = plugin(3, stack, line, cols, id, output.length)) {
							case null: case void 0: break; default: stack = cache
						}

					operation = 0
					output += stack
					stack = ''
				}

				frame = ''
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

							unknown = ''
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
							case COMMA: if (com + fun + str + attr === 0) char+='\n'; break
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

								char = ''

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

		// plugin, post context
		if (plugged > 0) {
			switch (cache = plugin(6, output, line, cols, id, output.length)) {
				case null: case void 0: break; default: output = cache
			}

			unknown = ''
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
	 * @return {String|void}
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
					case Array: for (var i = 0, l = plugins.length; i < l; i++) use(plugins[i++]); break
					default: plugins[plugged++] = plugin
				}
		}
	}

	/**
	 * Set
	 *
	 * @param {Object?} opts
	 */
	function set (opts) {
		for (var name in opts) {
			var value = opts[name]
			switch (name) {
				case 'global': glob = value|0; break;
				case 'cascade': cascade = !!value|0; break
				case 'prefix': prefix(value); break
				case keyframes: scope = value|0; break
			}
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
	compiler.prefix = prefix
	compiler.set = set

	return compiler
}))
