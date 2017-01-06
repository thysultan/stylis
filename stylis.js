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
	 * @example compiler('.class1', 'css...', false);
	 * 
	 * @param  {string}              selector   - i.e `.class` or `#id` or `[attr=id]`
	 * @param  {string}              styles
	 * @param  {boolean=}            animations - pass false to prevent prefixing animations, true by default
	 * @param  {function({string})=} middleware
	 * @return {string}
	 */
	function stylis (selector, styles, animations, middleware) {
		var prefix = '';
		var namespace = '';
		var type = selector.charCodeAt(0) || 0;

		// [ attr selector
		if (type === 91) {
			// `[data-id=namespace]` -> ['data-id', 'namespace']
			var attr = selector.substring(1, selector.length-1).split('=');     
			var char = (namespace = attr[1]).charCodeAt(0);

			// [data-id="namespace"]/[data-id='namespace']
			// --> "namespace"/'namspace' -> namespace
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

		// animation and keyframe namespace
		var anim = (animations === void 0 || animations === true) ? namespace : '';

		// has middleware
		var plugin = middleware !== void 0 && typeof middleware === 'function';

		// variables, i.e $a = 1;
		var vars;

		// mixins
		var mixins;
		var mixin;

		// buffers
		var buff = '';
		var blob = '';
		var prev = '';
		var flat = '';
		var blck = '';
		var indexOf = 0;

		// position
		var caret = 0;
		var depth = 0;
		var column = 0;
		var line = 1;
		var eof = styles.length;

		// context signatures
		var special = 0;
		var type = 0;
		var close = 0;
		var comment = 0;
		var strings = 0;

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

				// middleware
				plugin && (buff = middleware(0, buff, line, column) || buff);

				// ignore comments
				if (comment === 2) {
					if (code === 125) {
						comment = 0;
					}

					buff = ''; 
				}
				// @, special block
				else if (first === 64) {
					// @keyframe/@global, `k` or @global, `g` character
					if (second === 107 || second === 103) {
						// k, @keyframes
						if (second === 107) {
							blob = buff.substring(1, 11) + anim + buff.substring(11);
							buff = '@-webkit-'+blob;
							type = 1;
						}
						// g, @global 
						else {
							buff = '';
						}
					}
					// @media/@mixin `m` character
					else if (second === 109) {
						if (third === 105) {
							// first match create mixin store
							mixins === void 0 && (mixins = {});

							// retrieve mixin identifier
							blob = (mixin = buff.substring(7, buff.indexOf('{')) + ' ').trim();
							mixin = mixin.substring(0, mixin.indexOf(' ')).trim();

							// append mixin identifier
							mixins[mixin] = { key: blob.trim(), body: null };

							type = 3;
							buff = '';
							blob = '';
						}
						// @media 
						else {
							type = 2;
						}
					}

					// @include/@import `i` character
					if (second === 105) {
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
										buff = buff.replace(new RegExp('\\'+arg, 'g'), argsPassed[i].trim());
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
								// middleware
								buff = middleware(3, match[1].replace(/['"; ]/g, ''), line, column) || '';

								if (buff) {
									// create block and update styles length
									styles += buff;
									eof += buff.length;
								}

								buff = '';
							}
						}
					} else {
						close = -1;
						special++;
					}
				}
				// $, variable
				else if (first === 36) {
					var colon = buff.indexOf(':');

					// first match create variables store 
					vars === void 0 && (vars = []);

					// push key value pair
					vars[vars.length] = [buff.substring(0, colon), buff.substring(colon+1, buff.length-1).trim()];

					// reset buffer
					buff = '';
				}
				// property/selector
				else {
					// animation: a, n, i characters
					if (first === 97 && second === 110 && third === 105) {
						var ninth = buff.charCodeAt(9) || 0;
						var tenth = buff.charCodeAt(10) || 0;

						var colon = buff.indexOf(':')+1;
						var build = buff.substring(0, colon);
						var anims = buff.substring(colon).split(',');

						// -, n
						var ns = (ninth !== 45 ? anim : ( tenth !== 110 ? '' : anim));

						for (var j = 0, length = anims.length; j < length; j++) {
							build += (j === 0 ? '' : ',') + ns + anims[j].trim();
						}

						// vendor prefix
						buff = '-webkit-' + build + build;
					}
					// appearance: a, p, p
					else if (first === 97 && second === 112 && third === 112) {
						// vendor prefix -webkit- and -moz-
						buff = '-webkit-' + buff + '-moz-' + buff + buff;
					}
					// hyphens: h, y, p
					// user-select: u, s, e
					else if (
						(first === 104 && second === 121 && third === 112) ||
						(first === 117 && second === 115 && third === 101)
					) {
						// vendor prefix all
						buff = '-webkit-' + buff + '-moz-' + buff + '-ms-' + buff + buff;
					}
					// flex: f, l, e
					// order: o, r, d
					else if (
						(first === 102 && second === 108 && third === 101) ||
						(first === 111 && second === 114 && third === 100)
					) {
						// vendor prefix only -webkit-
						buff = '-webkit-' + buff + buff;
					}
					// transforms & transitions: t, r, a 
					else if (first === 116 && second === 114 && third === 97) {
						// vendor prefix -webkit- and -ms- if transform
						buff = '-webkit-' + buff + (buff.charCodeAt(5) === 102 ? '-ms-' + buff : '') + buff;
					}
					// display: d, i, s
					else if (first === 100 && second === 105 && third === 115) {
						if (buff.indexOf('flex') > -1) {
							// vendor prefix
							buff = 'display:-webkit-flex; display:flex;';
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
								var inner   = '';
								var nestSel = buff.substring(0, buff.length-1).split(',');
								var prevSel = prev.substring(0, prev.length-1).split(',');

								// keep track of opening `{` and `}` occurrences
								var counter = 1;

								// travel to the end of the block
								while (caret < eof) {
									var char = styles.charCodeAt(caret);

									// {, }, nested blocks may have nested blocks
									char === 123 ? counter++ : char === 125 && counter--;

									// break when the has ended
									if (counter === 0) {
										break;
									}

									// build content of nested block
									inner += styles[caret++];
								}

								// handle multiple selectors: h1, h2 { div, h4 {} } should generate
								// -> h1 div, h2 div, h2 h4, h2 div {}
								for (var j = 0, length = prevSel.length; j < length; j++) {
									// extract value, prep index for reuse
									var val = prevSel[j]; prevSel[j] = '';

									// since there can also be multiple nested selectors
									for (var k = 0, l = nestSel.length; k < l; k++) {
										prevSel[j] += (
											(val.replace(prefix, '').trim() + ' ' + nestSel[k].trim()).trim() + 
											(k === l-1  ? '' : ',')
										);
									}
								}

								// create block and update styles length
								// the new line is to avoid conflicts when the last line is a // line comments
								eof += (styles += ('\n' + prevSel.join(',') + '{'+inner+'}').replace(/&| +&/g, '')).length;

								// clear current line, to avoid add block elements to the normal flow
								buff = '';

								// decreament depth
								depth--;
							}
							// top-level selector
							else {
								var split = buff.split(',');
								var build = '';

								// prefix multiple selectors with namesapces
								// @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
								for (var j = 0, length = split.length; j < length; j++) {
									var selector = split[j];
									var firstChar = selector.charCodeAt(0);

									// ` `, trim if first char is space
									if (firstChar === 32) {
										firstChar = (selector = selector.trim()).charCodeAt(0);
									}

									// [, [title="a,b,..."]
									if (firstChar === 91) {
										for (var k = j+1, l = length-j; k < l; k++) {
											var broken = (selector += ',' + split[k]).trim();

											// ]
											if (broken.charCodeAt(broken.length-1) === 93) {
												length -= k;
												split.splice(j, k);
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
									// : 
									else if (firstChar === 58) {
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
												// before: `-context(selector)`
												selector = selector.substring(9, selector.indexOf(')')) + ' ' + prefix + ' {';
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
											selector = selector.substring(8).replace(')', '');
											// after: selector
										}
										// :hover, :active, :focus, etc...
										else {
											selector = prefix + selector;
										}
									}
									else {
										selector = prefix + ' ' + selector;
									}

									// if first selector do not prefix with `,`
									build += j === 0 ? selector : ',' + selector;
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

							// reset flags
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
						flat += buff; 
						buff = '';
					}
				}

				// append line to blck buffer
				blck += buff; 

				// reset line buffer
				buff = ''; 

				// add blck buffer to output, 
				if (code === 125 && type === 0 && comment === 0) {
					// middleware
					plugin && blck.length !== 0 && (blck = middleware(1, blck, line, column) || blck);

					// append blck buffer
					output += blck;

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
						strings = strings === 34 ? 0 : 34;
					}
					// ' character
					else if (code === 39) {
						// exit string ' context / enter string context
						strings = strings === 39 ? 0 : 39;
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

		// has flat css 
		if (flat.length !== 0) {
			flat = prefix + ' {' + flat + '}';

			// middleware
			plugin && (flat = middleware(2, flat, line, column) || flat);

			// append flat css
			output += flat;
		}

		// replace variables
		if (vars !== void 0) {
			for (var i = 0, l = vars.length; i < l; i++) {	
				output = output.replace(new RegExp('\\'+vars[i][0], 'g'), vars[i][1]);
			}
		}

		return output;
	}

	return stylis;
}));