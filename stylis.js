/*
 *          __        ___     
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  ) 
 * /____/\__/\__, /_/_/____/  
 *          /____/            
 * 
 * stylis is a small css compiler
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} else {
		window.stylis = factory(window);
	}
}(function (window) {
	'use strict';


	/**
	 * css compiler
	 *
	 * @example stylis('.foo', 'css...', true, true, null);
	 * 
	 * @param  {string}   selector   - i.e `.class` or `#id` or `[attr=id]`
	 * @param  {string}   styles     - css string
	 * @param  {boolean=} animations - prefix animations and keyframes, true by default
	 * @param  {boolean=} compact    - enable additional features(mixins and variables)
	 * @param  {function(context, content, line, column)=} middleware
	 * @return {string}
	 */
	function stylis (selector, styles, animations, compact, middleware) {
		// to string
		selector += '';

		var prefix = '';
		var namespace = '';
		var type = selector.charCodeAt(0) || 0;

		// [ attr selector
		if (type === 91) {
			// `[data-id=namespace]` -> ['data-id', 'namespace']
			var attr = selector.substring(1, selector.length-1).split('=');
			var char = (namespace = attr[1]).charCodeAt(0);

			// [data-id="namespace"]/[data-id='namespace']
			// --> "namespace"/'namspace' --> namespace
			if (char === 34 || char === 39) {
				namespace = namespace.substring(1, namespace.length-1);
			}

			prefix = '['+ attr[0] + '="' + namespace +'"]';
		}
		// `#` `.` `>` id class and descendant selectors
		else if (type === 35 || type === 46 || type === 62) {
			namespace = (prefix = selector).substring(1);
		}
		// element selector
		else {
			namespace = prefix = selector;
		}

		// reset type signature
		type = 0;

		// animation and keyframe namespace
		var animns = (animations === void 0 || animations === true) ? namespace : '';

		// has middleware
		var plugin = middleware != null && typeof middleware === 'function';

		var inner;
		var selectors;
		var build;
		var media;
		var flat;
		var temp;
		var prev;
		var indexOf;

		// variables
		var variables;

		// mixins
		var mixins;
		var mixin;

		// buffers
		var buff = '';
		var blob = '';
		var blck = '';

		// positions
		var caret = 0;
		var depth = 0;
		var column = 0;
		var line = 1;
		var eof = styles.length;

		// context signatures		
		var special = 0;
		var close = 0;
		var closed = 0;
		var comment = 0;
		var strings = 0;

		// prefixes
		var moz = '-moz-';
		var ms = '-ms-';
		var webkit = '-webkit-';

		var output = '';

		// parse + compile
		while (caret < eof) {
			var code = styles.charCodeAt(caret);

			// {, }, ; characters, parse line by line
			if (strings === 0 && (code === 123 || code === 125 || code === 59)) {
				buff += styles[caret];

				var first = buff.charCodeAt(0);

				// only trim when the first character is a space ` `
				if (first === 32) {
					first = (buff = buff.trim()).charCodeAt(0);
				}

				// default to 0 instead of NaN if there is no second/third character
				var second = buff.charCodeAt(1) || 0;
				var third = buff.charCodeAt(2) || 0;

				// middleware, selector/property context, }
				if (plugin && code !== 125) {
					// selector, {
					if (code === 123) {
						temp = middleware(0, buff.substring(0, buff.length-1).trim(), line, column);
					} 
					// property, ;
					else {
						temp = middleware(1, buff, line, column);
					}

					if (temp !== void 0) {
						buff = code === 123 ? temp + '{' : temp;
					}
				}

				// ignore comments
				if (comment === 2) {
					code === 125 && (comment = 0);
					buff = ''; 
				}
				// @, special block
				else if (first === 64) {
					// @keyframe/@global, `k` or @global, `g` character
					if (second === 107 || second === 103) {
						// k, @keyframes
						if (second === 107) {
							blob = buff.substring(1, 11) + animns + buff.substring(11);
							buff = '@'+webkit+blob;
							type = 1;
						}
						// g, @global
						else {
							buff = '';
						}
					}
					// @media/@mixin `m` character
					else if (second === 109) {
						// @mixin
						if (compact === true && third === 105) {
							// first match create mixin store
							mixins === void 0 && (mixins = {});

							// retrieve mixin identifier
							blob = (mixin = buff.substring(7, buff.indexOf('{')) + ' ').trim();

							// cache current mixin name
							mixin = mixin.substring(0, mixin.indexOf(' ')).trim();

							// append mixin identifier
							mixins[mixin] = {key: blob.trim(), body: ''};

							type = 3;
							buff = '';
							blob = '';
						}
						// @media
						else if (third === 101) {
							// nested
							if (depth !== 0) {
								// discard first character {
								caret++;
								
								media = '';
								inner = '';
								selectors = prev.split(',');

								// keep track of opening `{` and `}` occurrences
								closed = 1;

								// travel to the end of the block
								while (caret < eof) {
									var char = styles.charCodeAt(caret);

									// {, }, nested blocks may have nested blocks
									char === 123 ? closed++ : char === 125 && closed--;

									// break when the nested block has ended
									if (closed === 0) {
										break;
									}

									// build content of nested block
									inner += styles[caret++];
								}

								for (var i = 0, length = selectors.length; i < length; i++) {
									selector = selectors[i];

									// build media block
									media += stylis(
										// remove { on last selector
										(i === length - 1 ? selector.substring(0, selector.length-1) :  selector).trim(),
										inner, 
										animations, 
										compact, 
										middleware
									);
								}

								media = buff + media + '}';
								buff = '';
								type = 4;
							}
							// top-level
							else {
								type = 2;
							}
						}
						// unknown
						else {
							type = 6;
						}
					}

					// @include/@import `i` character
					if (second === 105) {	
						if (compact === true) {					
							// @include `n` character
							if (third === 110) {
								buff = buff.substring(9, buff.length-1);
								indexOf = buff.indexOf('(');

								// function mixins
								if (indexOf > -1) {
									// mixin name
									var name = buff.substring(0, indexOf);

									// mixin data
									var data = mixins[name];

									// args passed to the mixin
									var argsPassed = buff.substring(name.length+1, buff.length-1).split(',');

									// args the mixin expects
									var argsExpected = data.key.replace(name, '').replace(/\(|\)/g, '').trim().split(',');
									
									buff = data.body;

									for (var i = 0, length = argsPassed.length; i < length; i++) {
										var arg = argsExpected[i].trim();

										// if the mixin has a slot for that arg
										if (arg !== void 0) {
											buff = buff.replace(new RegExp('var\\(~~'+arg+'\\)', 'g'), argsPassed[i].trim());
										}
									}

									// create block and update styles length
									styles += buff;
									eof += buff.length;

									// reset
									buff = '';
								}
								// static mixins
								else {
									buff = mixins[buff].body;

									if (depth === 0) {
										// create block and update styles length
										styles += buff;
										eof += buff.length;

										// reset
										buff = '';
									}
								}
							}
							// @import `m` character
							else if (third === 109 && plugin) {
								// avoid "foo.css"; "foo" screen; "http://foo.com/bar"; url(foo);
								var match = /@import.*?(["'][^\.\n\r]*?["'];|["'].*\.scss["'])/g.exec(buff);

								if (match !== null) {
									// middleware, import context
									buff = middleware(4, match[1].replace(/['"; ]/g, ''), line, column) || '';

									if (buff) {
										// create block and update styles length
										styles += buff;
										eof += buff.length;
									}

									buff = '';
								}
							}
						}
					}
					// flag special block context
					else if (type !== 4) {
						close = -1;
						special++;
					}
				}
				// ~, ; variables
				else if (compact === true && code === 59 && first === 126 && second === 126) {
					var colon = buff.indexOf(':');

					// first match create variables store 
					variables === void 0 && (variables = []);

					// push key value pair
					variables[variables.length] = [buff.substring(0, colon), buff.substring(colon+1, buff.length-1).trim()];

					// reset buffer
					buff = '';
				}
				// property/selector
				else {
					// animation: a, n, i characters
					if (first === 97 && second === 110 && third === 105) {
						// removes ;
						buff = buff.substring(0, buff.length-1);

						// position of :
						var colon = buff.indexOf(':')+1;

						// left hand side everything before `:`
						build = buff.substring(0, colon);

						// right hand side everything after `:` /* @type string[] */
						var anims = buff.substring(colon).trim().split(',');

						// - short hand animation syntax
						if ((buff.charCodeAt(9) || 0) !== 45) {
							// because we can have multiple animations `animation: slide 4s, slideOut 2s`
							for (var j = 0, length = anims.length; j < length; j++) {
								var anim = anims[j];
								var props = anim.split(' ');

								// since we can't be sure of the position of the name of the animation we have to find it
								for (var k = 0, l = props.length; k < l; k++) {
									var prop = props[k].trim();
									var frst = prop.charCodeAt(0);
									var third = prop.charCodeAt(2);
									var slen = prop.length;
									var last = prop.charCodeAt(slen-1);

									// animation name is anything not in this list
									if (
										// cubic-bezier()
										!(frst === 99 && last === 41) &&

										// infinite, i, f, e
										!(frst === 105 && third === 102 && last === 101 && slen === 8) &&

										// linear, l, n, r
										!(frst === 108 && third === 110 && last === 114 && slen === 6) &&

										// alternate, a, t, e
										!(frst === 97 && third === 116 && last === 101 && slen === 9) &&

										// normal, n, r, l
										!(frst === 110 && third === 114 && last === 108 && slen === 6) &&

										// backwords, b, c, s
										!(frst === 98 && third === 99 && last === 115 && slen === 9) &&

										// forwards, f, r, s
										!(frst === 102 && third === 114 && last === 115 && slen === 8) &&

										// both, b, t, h
										!(frst === 98 && third === 116 && last === 104 && slen === 4) &&

										// none, n, n, e
										!(frst === 110 && third === 110 && last === 101 && slen === 4)&&

										// ease, e, s, e
										!(frst === 101 && third === 115 && last === 101 && slen === 4) &&

										// ease-
										!(frst === 101 && slen > 4 && prop.charCodeAt(4) === 45) &&

										// durations 0.4ms, .4s, 400ms ...
										isNaN(parseFloat(prop))
									) {
										props[k] = animns+prop;
										anim = props.join(' ');
									}
								}

								build += (j === 0 ? '' : ',') + anim.trim();
							}
						}
						// explicit syntax, anims array should have only one elemenet
						else {
							// n
							build += ((buff.charCodeAt(10) || 0) !== 110 ? '' : animns) + anims[0].trim();
						}

						// vendor prefix
						buff = webkit + build + ';' + build + ';';
					}
					// appearance: a, p, p
					else if (first === 97 && second === 112 && third === 112) {
						// vendor prefix -webkit- and -moz-
						buff = (
							webkit + buff + 
							moz + buff + 
							buff
						);
					}
					// display: d, i, s
					else if (first === 100 && second === 105 && third === 115) {
						if (buff.indexOf('flex') > -1) {
							// vendor prefix
							buff = 'display:'+webkit+'box;display:'+webkit+'flex;'+ms+'flexbox;display:flex;';
						}
					}
					// transforms & transitions: t, r, a 
					else if (first === 116 && second === 114 && third === 97) {
						// vendor prefix -webkit- and -ms- if transform
						buff = (
							webkit + buff + 
							(buff.charCodeAt(5) === 102 ? ms + buff : '') + 
							buff
						);
					}
					// hyphens: h, y, p
					// user-select: u, s, e
					else if (
						(first === 104 && second === 121 && third === 112) ||
						(first === 117 && second === 115 && third === 101)
					) {
						// vendor prefix all
						buff = (
							webkit + buff + 
							moz + buff + 
							ms + buff + 
							buff
						);
					}
					// flex: f, l, e
					else if (first === 102 && second === 108 && third === 101) {
						// vendor prefix all but moz
						buff = (
							webkit + buff + 
							ms + buff + 
							buff
						);
					}
					// order: o, r, d
					else if (first === 111 && second === 114 && third === 100) {
						// vendor prefix all but moz
						buff = (
							webkit + buff + 
							ms + 'flex-' + buff + 
							buff
						);
					}
					// align-items, align-center, align-self: a, l, i, -
					else if (first === 97 && second === 108 && third === 105 && (buff.charCodeAt(5) || 0) === 45) {
						switch (buff.charCodeAt(6) || 0) {
							// align-items, i
							case 105: {
								temp = buff.replace('-items', '');
								buff = (
									webkit + 'box-' + temp + 
									ms + 'flex-'+ temp + 
									buff
								);
								break;
							}
							// align-self, s
							case 115: {
								buff = (
									ms + 'flex-item-' + buff.replace('-self', '') + 
									buff
								);
								break;
							}
							// align-content
							default: {
								buff = (
									ms + 'flex-line-pack' + buff.replace('align-content', '') + 
									buff
								);
								break;
							}
						}
					}
					// { character, selector declaration
					else if (code === 123) {
						depth++;

						if (special === 0 || type === 2) {
							// nested selector
							if (depth === 2) {
								// discard first character {
								caret++;

								// inner content of block
								inner = '';
								
								var nestSelector = buff.substring(0, buff.length-1).split(',');
								var prevSelector = prev.substring(0, prev.length-1).split(',');

								// keep track of opening `{` and `}` occurrences
								closed = 1;

								// travel to the end of the block
								while (caret < eof) {
									var char = styles.charCodeAt(caret);

									// {, }, nested blocks may have nested blocks
									char === 123 ? closed++ : char === 125 && closed--;

									// break when the nested block has ended
									if (closed === 0) {
										break;
									}

									// build content of nested block
									inner += styles[caret++];
								}

								// handle multiple selectors: h1, h2 { div, h4 {} } should generate
								// -> h1 div, h2 div, h2 h4, h2 div {}
								for (var j = 0, length = prevSelector.length; j < length; j++) {
									// extract value, prep index for reuse
									temp = prevSelector[j];
									prevSelector[j] = '';

									// since there could also be multiple nested selectors
									for (var k = 0, l = nestSelector.length; k < l; k++) {
										selector = temp.replace(prefix, '').trim();

										if (nestSelector[k].indexOf(' &') > 0) {
											selector = nestSelector[k].replace('&', '').trim() + ' ' + selector;
										} else {
											selector = selector + ' ' + nestSelector[k].trim();
										}

										prevSelector[j] += selector.trim() + (k === l - 1  ? '' : ',');
									}
								}

								// create block and update styles length
								// the `new line` is to avoid conflicts when the last line is a // line comment
								eof += (styles += ('\n' + prevSelector.join(',') + ' {'+inner+'}').replace(/&| +&/g, '')).length;

								// clear current line, to avoid adding nested blocks to the normal flow
								buff = '';

								// decreament depth
								depth--;
							}
							// top-level selector
							else {
								selectors = buff.split(',');
								build = '';

								// prefix multiple selectors with namesapces
								// @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
								for (var j = 0, length = selectors.length; j < length; j++) {
									var firstChar = (selector = selectors[j]).charCodeAt(0);

									// ` `, trim if first character is a space
									if (firstChar === 32) {
										firstChar = (selector = selector.trim()).charCodeAt(0);
									}

									// [, [title="a,b,..."]
									if (firstChar === 91) {
										for (var k = j+1, l = length-j; k < l; k++) {
											var broken = (selector += ',' + selectors[k]).trim();

											// ], end
											if (broken.charCodeAt(broken.length-1) === 93) {
												length -= k;
												selectors.splice(j, k);
												break;
											}
										}
									}

									// &
									if (firstChar === 38) {
										// before: & {
										selector = prefix + selector.substring(1);
										// after: ${prefix} {
									}
									else {
										// default to :global if & exist outside of the first non-space character
										if ((indexOf = selector.indexOf(' &')) > 0) {
											// `:`
											firstChar = 58;
											// before: html & {
											selector = ':global('+selector.substring(0, indexOf)+')' + selector.substring(indexOf);
											// after: html ${prefix} {
										}

										// :
										if (firstChar === 58) {
											var secondChar = selector.charCodeAt(1);

											// h, t, :host
											if (secondChar === 104 && selector.charCodeAt(4) === 116) {
												var nextChar = (selector = selector.substring(5)).charCodeAt(0);

												// :host(selector)                    
												if (nextChar === 40) {
													// before: `(selector)`
													selector = prefix + selector.substring(1).replace(')', '');
													// after: ${prefx} selector {
												}
												// :host-context(selector)
												else if (nextChar === 45) {
													indexOf = selector.indexOf(')');

													// before: `-context(selector)`
													selector = (
														selector.substring(9, indexOf)+' '+prefix+selector.substring(indexOf+1)
													);
													// after: selector ${prefix} {
												}
												// :host
												else {
													selector = prefix + selector;
												}
											}
											// g, :global(selector)
											else if (secondChar === 103) {
												// before: `:global(selector)`
												selector = selector.substring(8).replace(')', '').replace('&', prefix);
												// after: selector
											}
											// :hover, :active, :focus, etc...
											else {
												selector = prefix + selector;
											}
										}
										// non-pseudo selectors
										else {
											selector = prefix + ' ' + selector;
										}
									}

									// if first selector do not prefix with `,`
									build += (j === 0 ? selector : ',' + selector);
								}

								// cache current selector
								prev = (buff = build);
							}
						}
					}
					// } character
					else if (code === 125 && depth !== 0) {
						depth--;
					}

					// @global/@keyframes
					if (special !== 0) {
						// find the closing tag
						code === 125 ? close++ : (code === 123 && close !== 0 && close--);

						// closing tag
						if (close === 0) {
							// @global
							if (type === 0) {
								buff = '';
							}
							// @keyframes 
							else if (type === 1) {
								// vendor prefix
								buff = '}@'+blob+'}';

								// reset
								blob = '';
							}
							// @media
							else if (type === 2) {
								blob.length !== 0 && (buff = prefix + ' {'+blob+'}' + buff);

								// reset
								blob = '';
							}
							// @mixin
							else if (type === 3) {
								// append body of mixin
								mixins[mixin].body = blob;

								// reset
								mixin = '';
								buff = '';
								blob = '';
							}

							// reset signatures
							type = 0;
							close--;
							special--;
						}
						// @keyframes, @mixin
						else if (type === 1 || type === 3) {
							blob += buff;

							if (type === 3) {
								buff = '';
							}
						}
						// @media flat context
						else if (type === 2 && depth === 0 && code !== 125) {
							blob += buff;
							buff = '';
						}
					}
					// flat context
					else if (depth === 0 && code !== 125) {
						flat = flat === void 0 ? buff : flat + buff;
						buff = '';
					}
				}

				// append line to blck buffer
				blck += buff;

				// reset line buffer
				buff = '';

				// add blck buffer to output
				if (code === 125 && comment === 0 && (type === 0 || type === 4)) {					
					// append if the block is not empty {}
					if (blck.charCodeAt(blck.length-2) !== 123) {
						// middleware, block context
						if (plugin && blck.length !== 0) {
							temp = middleware(2, blck, line, column);

							temp !== void 0 && (blck = temp);
						}

						// append blck buffer
						output += blck.trim();
					}

					// nested @media
					if (type === 4) {
						// middleware, block context
						if (plugin) {
							temp = middleware(2, media, line, column);

							temp !== void 0 && (media = temp);
						}

						// reset
						type = 0;

						// concat nested @media block
						output += media;
					}

					// reset blck buffer
					blck = '';
				}
			}
			// build line by line
			else {
				// \r, \n, new lines
				if (code === 13 || code === 10) {
					// ignore line and block comments
					if (comment === 2) {
						buff = '';
						comment = 0;
					}

					column = 0;
					line++;
				}
				// not `\t` tab character
				else if (code !== 9) {
					// " character
					if (code === 34) {
						// exit string " context / enter string context
						strings = strings === 34 ? 0 : (strings === 39 ? 39 : 34);
					}
					// ' character
					else if (code === 39) {
						// exit string ' context / enter string context
						strings = strings === 39 ? 0 : (strings === 34 ? 34 : 39);
					}
					// / character
					else if (code === 47) {
						code === 47 && comment < 2 && comment++;
					}

					// build line buffer
					buff += styles[caret];
				}
			}

			// move caret position
			caret++;

			// move column position
			column++;
		}

		// has flat css, since flat css can appear any where we add them last
		if (flat !== void 0) {
			flat = prefix + ' {' + flat + '}';

			// middleware, flat context
			if (plugin) {
				temp = middleware(3, flat, line, column);
				
				temp !== void 0 && (flat = temp);
			}

			// append flat css
			output += flat;
		}

		// has variables
		if (variables !== void 0) {
			// replace all variables
			for (var i = 0, l = variables.length; i < l; i++) {
				output = output.replace(new RegExp('var\\('+variables[i][0]+'\\)', 'g'), variables[i][1]);
			}
		}

		return output;
	}

	return stylis;
}));