/*
 *          __        ___     
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  ) 
 * /____/\__/\__, /_/_/____/  
 *          /____/            
 * 
 * stylis is a feature-rich css preprocessor
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	}
	else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} 
	else {
		window.stylis = factory(window);
	}
}(function (window) {

	
	'use strict';


	/**
	 * css preprocessor
	 *
	 * @example stylis('.foo', 'css...', true, true, null);
	 * 
	 * @param  {string}   selector   - i.e `.class` or `#id` or `[attr=id]`
	 * @param  {string}   styles     - css string
	 * @param  {boolean=} animations - prefix animations and keyframes, true by default
	 * @param  {boolean=} compact    - enable additional features(mixins and variables)
	 * @param  {function(context, content, line, column, namespace)=} middleware
	 * @return {string}
	 */
	function stylis (selector, styles, animations, compact, middleware) {
		/* @type {string} */
		selector += '';

		var prefix = '';
		var namespace = '';

		/* @type {number} */
		var type = selector.charCodeAt(0);
		
		var char;
		var character;
		var attr;
		var animns;
		var uses;

		// [ attr selector
		if (type === 91) {
			// `[data-id=namespace]` -> ['data-id', 'namespace']
			attr = selector.substring(1, selector.length - 1).split('=');
			char = (namespace = attr[1]).charCodeAt(0);

			// [data-id="namespace"]/[data-id='namespace']
			// --> "namespace"/'namspace' --> namespace
			if (char === 34 || char === 39) {
				namespace = namespace.substring(1, namespace.length - 1);
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
		if (animations == void 0 || animations === true) {
			animations = true;
			animns = namespace;
		}
		else {
			animns = '';
			animations = false;
		}

		// middleware
		var use = middleware != null;
		var plugins = stylis.plugins;
		var length = plugins.length;

		if (use) {
			uses = (typeof middleware).charCodeAt(0);

			// o, object/array
			if (uses === 111) {
				stylis.use(middleware, null);
			}
			// f, function
			else if (uses === 102) {
				plugins[length++] = middleware;
			}
			else {
				use = false;
			}
		}

		if (length !== 0) {
			middleware = length === 1 ? plugins[0] : function (ctx, str, line, col, prefix, length) {
				var output = str;

				for (var i = 0, l = plugins.length; i < l; i++) {
					output = plugins[i](ctx, output, line, col, prefix, length) || output;
				}

				if (output !== str) {
					return output;
				}
			};

			use = true;
		}

		// declare
		var colon;
		var inner;
		var selectors;
		var build;
		var media;
		var temp;
		var prev;
		var indexOf;
		var first;
		var second;
		var third;
		var sel;
		var blob;
		var nest;
		var query;
		var str;

		// variables
		var vars;
		var varlen;

		// mixins
		var mixins;
		var mixin;

		// prefixes
		var moz = '-moz-';
		var ms = '-ms-';
		var webkit = '-webkit-';

		// buffers
		var buff = '';
		var blck = '';
		var flat = '';

		// character code
		var code = 0;

		// context signatures		
		var special = 0;
		var close = 0;
		var closed = 0;
		var nested = 0;
		var func = 0;
		var medias = 0;
		var strings = 0;
		var glob = 0;
		var globs = 0;

		// context(flat) signatures
		var levels = 0;
		var level = 0;

		// comments
		var comment = 0;
		var comblck = 0;
		var comline = 0;

		// pre-process
		if (use) {
			temp = middleware(0, styles, line, column, prefix, 0);
			
			if (temp != null) {
				styles = temp;
			}

			str = '';
		}

		// positions
		var caret = 0;
		var depth = 0;
		var column = 0;
		var line = 1;
		var eof = styles.length;

		// compiled output
		var output = '';

		// parse + compile
		while (caret < eof) {
			/* @type {number} */
			code = styles.charCodeAt(caret);

			// {, }, ; characters, parse line by line
			if (strings === 0 && func === 0 && comment === 0 && (code === 123 || code === 125 || code === 59)) {
				buff += styles.charAt(caret);

				// middleware, selector/property context, }
				if (use && code !== 125) {
					if (use) {
						// { pre-processed selector context
						if (code === 123) {
							temp = middleware(
								1, 
								buff.substring(0, buff.length - 1).trim(), 
								line, 
								column, 
								prefix, 
								output.length
							);
						} 
						// ; property context
						else {
							temp = middleware(2, buff, line, column, prefix, output.length);
						}

						if (temp != null) {
							buff = code === 123 ? temp + ' {' : temp;
						}
					}
				}

				first = buff.charCodeAt(0);

				// only trim when the first character is a space ` `
				if (first === 32) {
					first = (buff = buff.trim()).charCodeAt(0);
				}

				// default to 0 instead of NaN if there is no second/third character
				second = buff.charCodeAt(1);
				third = buff.charCodeAt(2);

				// @, special block
				if (first === 64) {
					// push flat css
					if (levels === 1 && flat.length !== 0) {
						levels = 0;
						flat = prefix + ' {' + flat + '}';

						// middleware, flat context
						if (use) {
							temp = middleware(4, flat, line, column, prefix, output.length);
						
							if (temp != null) {
								flat = temp;
							}
						}

						output += flat;
						flat = '';
					}

					// ;
					if (code !== 59) {
						// @keyframe/@global, `k` or @global, `g` character
						if (second === 107 || second === 103) {
							// k, @keyframes
							if (second === 107) {
								blob = buff.substring(1, 11) + (glob === 0 ? animns : '') + buff.substring(11);
								buff = '@' + webkit + blob;
								type = 1;
							}
							// g, @global
							else {
								glob = 1;
								buff = '';
							}
						}
						// @media/@mixin `m` character
						else if (second === 109) {
							// @mixin
							if (compact === true && third === 105) {
								// first match create mixin store
								if (mixins === void 0) {
									mixins = {};
								}

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
									column++;
									
									if (media === void 0) {
										media = '';
									}

									temp = '';
									inner = '';
									selectors = prev.split(stylis.regex.split);

									// keep track of opening `{` and `}` occurrences
									closed = 1;

									// travel to the end of the block
									while (caret < eof) {
										char = styles.charCodeAt(caret);

										// {, }, nested blocks may have nested blocks
										if (char === 123) {
											closed++;
										}
										else if (char === 125) {
											closed--;
										}

										// break when the nested block has ended
										if (closed === 0) {
											break;
										}

										// build content of nested block
										inner += styles.charAt(caret++);

										// move column and line position
										column = (char === 13 || char === 10) ? (line++, 0) : column + 1; 
									}

									length = selectors.length;

									for (var i = 0; i < length; i++) {
										selector = selectors[i];

										// build media block
										temp += stylis(
											// remove { on last selector
											(i === length - 1 ? selector.substring(0, selector.length - 1) :  selector).trim(),
											inner, 
											animations, 
											compact, 
											middleware
										);
									}

									media += buff + temp + '}';
									buff = '';
									medias = 1;
									type = 4;
								}
								// top-level
								else {
									type = 2;
									query = buff;
									buff = '';
								}
							}
							// unknown
							else {
								type = 6;
							}
						}
					}

					// @include/@import `i` character
					if (second === 105) {
						// @include `n` character
						if (compact === true && third === 110) {
							buff = buff.substring(9, buff.length - 1);
							indexOf = buff.indexOf('(');

							// function mixins
							if (indexOf !== -1) {
								// mixin name
								var name = buff.substring(0, indexOf);

								// mixin data
								var data = mixins[name];

								// args passed to the mixin
								var passed = buff.substring(name.length + 1, buff.length - 1).split(',');

								// args the mixin expects
								var expected = data.key.replace(name, '').replace(/\(|\)/g, '').trim().split(',');
								
								buff = data.body;

								length = passed.length;

								for (var i = 0; i < length; i++) {
									var arg = expected[i].trim();

									// if the mixin has a slot for that arg
									if (arg !== void 0) {
										buff = buff.replace(new RegExp('var\\(~~'+arg+'\\)', 'g'), passed[i].trim());
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
						else if (third === 109 && use) {
							// avoid "foo.css"; "foo" screen; "http://foo.com/bar"; url(foo);
							var match = /@import.*?(["'`][^\.\n\r]*?["'`];|["'`][^:\r\n]*?\.[^c].*?["'`])/g.exec(buff);

							if (match !== null) {
								// middleware, import context
								buff = middleware(
									5, 
									match[1].replace(/['"; ]/g, ''), 
									line, 
									column, 
									prefix, 
									output.length
								) || '';

								if (buff) {
									// create block and update styles length
									styles = styles.substring(0, caret + 1) + buff + styles.substring(caret+1);
									eof += buff.length;
								}

								buff = '';
							}
						}
					}
					// flag special, i.e @keyframes, @global, @font-face ...
					else if (type !== 4 && code !== 59) {
						// k, g, m
						if (second !== 107 && second !== 103 && second !== 109) {
							type = 5;
						}

						close = -1;
						special++;
					}
				}
				// ~, ~, ; variables
				else if (
					compact === true && 
					first === 126 && 
					second === 126 && 
					code === 59 && 
					(colon = buff.indexOf(':')) !== -1
				) {
					// first match create variables store 
					if (varlen === void 0) {
						vars = [];
						varlen = 0;
					}

					// push key value pair
					vars[varlen++] = [buff.substring(0, colon), buff.substring(colon + 1, buff.length - 1).trim()];

					// reset buffer
					buff = '';
				}
				// property/selector
				else {
					// animation: a, n, i characters
					if (first === 97 && second === 110 && third === 105) {
						// removes ;
						buff = buff.substring(0, buff.length - 1);

						// position of :
						colon = buff.indexOf(':')+1;

						// left hand side everything before `:`
						build = buff.substring(0, colon);

						// short hand animation syntax
						if (animations === true && buff.charCodeAt(9) !== 45) {
							var anims = buff.substring(colon).trim().split(',');

							length = anims.length;

							// because we can have multiple animations `animation: slide 4s, slideOut 2s`
							for (var j = 0; j < length; j++) {
								var anim = anims[j];
								var props = anim.split(' ');

								// since we can't be sure of the position of the name of the animation we have to find it
								for (var k = 0, l = props.length; k < l; k++) {
									var prop = props[k].trim();
									var frst = prop.charCodeAt(0);
									var thrd = prop.charCodeAt(2);
									var len = prop.length;
									var last = prop.charCodeAt(len - 1);

									// animation name is anything not in this list
									if (
										// cubic-bezier()/steps(), ) 
										last !== 41 && len !== 0 &&

										// infinite, i, f, e
										!(frst === 105 && thrd === 102 && last === 101 && len === 8) &&

										// linear, l, n, r
										!(frst === 108 && thrd === 110 && last === 114 && len === 6) &&

										// alternate/alternate-reverse, a, t, e
										!(frst === 97 && thrd === 116 && last === 101 && (len === 9 || len === 17)) &&

										// normal, n, r, l
										!(frst === 110 && thrd === 114 && last === 108 && len === 6) &&

										// backwards, b, c, s
										!(frst === 98 && thrd === 99 && last === 115 && len === 9) &&

										// forwards, f, r, s
										!(frst === 102 && thrd === 114 && last === 115 && len === 8) &&

										// both, b, t, h
										!(frst === 98 && thrd === 116 && last === 104 && len === 4) &&

										// none, n, n, e
										!(frst === 110 && thrd === 110 && last === 101 && len === 4)&&

										// running, r, n, g 
										!(frst === 114 && thrd === 110 && last === 103 && len === 7) &&

										// paused, p, u, d
										!(frst === 112 && thrd === 117 && last === 100 && len === 6) &&

										// reversed, r, v, d
										!(frst === 114 && thrd === 118 && last === 100 && len === 8) &&

										// step-start/step-end, s, e, (t/d)
										!(
											frst === 115 && thrd === 101 && 
											((last === 116 && len === 10) || (last === 100 && len === 8)) 
										) &&

										// ease/ease-in/ease-out/ease-in-out, e, s, e
										!(
											frst === 101 && thrd === 115 &&
											(
												(last === 101 && len === 4) ||
												(len === 11 || len === 7 || len === 8) && prop.charCodeAt(4) === 45
											)
										) &&

										// durations, 0.4ms, .4s, 400ms ...
										isNaN(parseFloat(prop)) &&

										// handle spaces in cubic-bezier()/steps() functions
										prop.indexOf('(') === -1
									) {
										props[k] = animns + prop;
									}
								}

								build += (j === 0 ? '' : ',') + props.join(' ').trim();
							}
						}
						// explicit syntax, anims array should have only one elemenet
						else {
							// n
							build += ( 
								(buff.charCodeAt(10) !== 110 ? '' : animns) + 
								buff.substring(colon).trim().trim()
							);
						}

						// vendor prefix
						buff = webkit + build + ';' + build + (code === 125 ? ';}' : ';');
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
						// flex/inline-flex
						if ((indexOf = buff.indexOf('flex')) !== -1) {
							// e, inline-flex
							temp = buff.charCodeAt(indexOf-2) === 101 ? 'inline-' : '';

							// vendor prefix
							buff = (
								'display: '+webkit+temp+'box;'+
								'display: '+webkit+temp+'flex;'+
								'display: '+ms+'flexbox;'+
								'display: '+temp+'flex'+(code === 125 ? '}' : ';')
							);
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
					else if (first === 97 && second === 108 && third === 105 && buff.charCodeAt(5) === 45) {
						switch (buff.charCodeAt(6)) {
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
					// cursor, c, u, r
					else if (first === 99 && second === 117 && third === 114 && /zoo|gra/.exec(buff) !== null) {
						buff = (
							buff.replace(/: +/g, ': ' + webkit) + 
							buff.replace(/: +/g, ': ' + moz) +  
							buff
						);
					}
					// { character, selector declaration
					else if (code === 123) {
						depth++;

						// push flat css
						if (levels === 1 && flat.length !== 0) {
							levels = 0;
							flat = prefix + ' {' + flat + '}';

							// middleware, flat context
							if (use) {
								temp = middleware(4, flat, line, column, prefix, output.length);
							
								if (temp != null) {
									flat = temp;
								}
							}

							output += flat;
							flat = '';
						}

						// nested selector
						if (depth === 2) {
							// discard first character {
							caret++;
							column++;

							// inner content of block
							inner = '';

							var nestSelector = buff.substring(0, buff.length - 1).split(stylis.regex.split);
							var prevSelector = prev.substring(0, prev.length - 1).split(stylis.regex.split);

							// keep track of opening `{` and `}` occurrences
							closed = 1;

							// travel to the end of the block
							while (caret < eof) {
								char = styles.charCodeAt(caret);

								// {, nested blocks may have nested blocks
								if (char === 123) {
									closed++;
								}
								// },
								else if (char === 125) {
									closed--;
								}

								// break when the nested block has ended
								if (closed === 0) {
									break;
								}

								// build content of nested block
								inner += styles.charAt(caret++);

								// move column and line position
								column = (char === 13 || char === 10) ? (line++, 0) : column + 1; 
							}

							// handle multiple selectors: h1, h2 { div, h4 {} } should generate
							// -> h1 div, h2 div, h2 h4, h2 div {}
							
							length = prevSelector.length;

							for (var j = 0; j < length; j++) {
								// extract value, prep index for reuse
								temp = prevSelector[j];
								indexOf = temp.indexOf(prefix);

								prevSelector[j] = '';

								// since there could also be multiple nested selectors
								for (var k = 0, l = nestSelector.length; k < l; k++) {
									if (indexOf > 0) {
										selector = ':global()' + temp.trim();
									}
									else {
										selector = temp.replace(prefix, '&').trim();
									}

									sel = nestSelector[k].trim();

									if (sel.indexOf(' &') > 0) {
										selector = sel.replace('&', '').trim() + ' ' + selector;
									}
									else if (stylis.regex.global[0].exec(sel) !== null) {
										selector = sel;
									}
									else {
										selector = selector + ' ' + sel;
									}

									prevSelector[j] += selector.replace(/ +&/, '').trim() + (k === l - 1  ? '' : ',');
								}
							}

							if (nest === void 0) {
								nest = '';
							}

							// concat nest
							nest += (
								'\n' + 
								prevSelector.join(',').replace(stylis.regex.global[1], ' $1') + 
								' {'+inner+'}'
							);

							// signature
							nested = 1;

							// clear current line, to avoid adding nested blocks to the normal flow
							buff = '';

							// decreament depth
							depth--;
						}
						// top-level selector
						else if (glob === 0 && (special === 0 || type === 2)) {
							selectors = buff.split(stylis.regex.split);
							build = '';

							length = selectors.length;

							// prefix multiple selectors with namesapces
							// @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
							for (var j = 0; j < length; j++) {
								char = (selector = selectors[j]).charCodeAt(0);

								// ` `, trim if first character is a space
								if (char === 32) {
									char = (selector = selector.trim()).charCodeAt(0);
								}

								// &
								if (char === 38) {
									// before: & { / &&... {
									selector = prefix + selector.substring(1).replace(stylis.regex.and, prefix);
									// after: ${prefix} { / ${prefix}${prefix}...
								}

								// default to :global if & exist outside of the first non-space character
								if ((indexOf = selector.indexOf(' &')) > 0) {
									// `:`
									globs = 2;

									if (selector.indexOf(':global()') !== 0) {
										// before: html & {
										selector = (
											':global('+selector.substring(0, indexOf)+')' + selector.substring(indexOf)
										);
										// after: html ${prefix} {
									}
								}

								// g, :global(selector)
								if ((indexOf = selector.indexOf(':global(')) !== -1) {											
									if (globs !== 2) {
										globs = 1;
									}

									if (indexOf === 0) {
										char = 0;
									}

									// before: `:global(selector)`
									selector = (
										selector
											.replace(stylis.regex.global[0], '$1')
											.replace(stylis.regex.and, prefix)
									);
									// after: selector
								}

								// :
								if (char === 58) {
									var secondChar = selector.charCodeAt(1);

									// h, t, :host
									if (secondChar === 104 && selector.charCodeAt(4) === 116) {
										var nextChar = selector.charCodeAt(5);

										// (, :host(selector)                    
										if (nextChar === 40) {
											// before: `(selector)`
											selector = (
												prefix + (
													selector
														.replace(/:host\((.*)\)/g, '$1')
														.replace(stylis.regex.and, prefix)
												)
											);
											// after: ${prefx} selector {
										}
										// -, :host-context(selector)
										else if (nextChar === 45) {
											// before: `-context(selector)`
											selector = selector
												.replace(/:host-context\((.*)\)/g, '$1 ' + prefix)
												.replace(stylis.regex.and, prefix)
											// after: selector ${prefix} {
										}
										// :host
										else {
											selector = prefix + selector.substring(5);
										}
									}
									// :hover, :active, :focus, etc...
									else {
										selector = prefix + selector;
									}
								}
								// non-pseudo selectors
								else if (globs === 0 && char !== 38) {
									selector = prefix + ' ' + selector;
								}

								// middleware, post-processed selector context
								if (use) {
									temp = middleware(
										1.5, 
										j === length - 1 ? selector.substring(0, selector.length - 1).trim() : selector, 
										line, 
										column,
										prefix,
										output.length
									);

									if (temp != null) {
										selector = j === length - 1 ? temp + ' {' : temp;
									}
								}

								// if first selector do not prefix with `,`
								build += (j === 0 ? selector : ',' + selector);
							}

							buff = build;

							// cache current selector
							prev = globs !== 1 ? build : ':global()' + build;

							globs = 0;
						}
						else {
							prev = buff;
						}
					}
					
					// } character
					if (code === 125) {
						if (depth !== 0) {
							depth--;
						}

						// concat nested css
						if (depth === 0 && nested === 1) {
							styles = styles.substring(0, caret + 1) + nest + styles.substring(caret + 1);
							eof += nest.length;
							nest = '';
							nested = 0;
							close++;
						}

						// }, ` ` whitespace
						if (first !== 125 && buff.charCodeAt(buff.length - 2) === 32) {
							buff = buff.substring(0, buff.length-1).trim() + '}';
						}
					}

					// @global/@keyframes
					if (special !== 0) {
						// }, find closing tag
						if (code === 125) {
							close++;
						} 
						// {
						else if (code === 123 && close !== 0) {
							close--;
						}

						// append flat @media css
						if (level === 1 && (code === 123 || close === 0) && flat.length !== 0) {
							level = 0;
							buff = prefix + ' {'+flat+'}' + buff;
							flat = '';
						}

						// closing tag
						if (close === 0) {
							// @global
							if (type === 0) {
								glob = 0;
								buff = '';
							}
							// @keyframes 
							else if (type === 1) {
								// vendor prefix
								buff = '}@'+blob+'}';

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
						else if (type === 2 && depth === 0) {
							if (code !== 125) {
								if (level === 0) {
									flat = '';
								}

								flat += buff;
								buff = '';
							}

							level = 1;
						}
					}
					// flat context
					else if (depth === 0 && code !== 125) {
						levels = 1;
						flat = flat === void 0 ? buff : flat + buff;
						buff = '';
					}
				}

				// append line to blck buffer
				blck += buff;

				// add blck buffer to output
				if (code === 125 && (type === 0 || type === 2 || type === 4)) {					
					char = blck.charCodeAt(blck.length - 2);

					if (type === 4) {
						type = 0;
					}

					if (media !== void 0 && media.length !== 0) {
						blck = char === 123 ? media : blck + media;
						media = '';
						char = blck.charCodeAt(blck.length - 2);
					}

					// {, @
					if (char !== 123) {
						// middleware, block context
						if (use) {
							temp = middleware(3, blck, line, column, prefix, output.length);

							if (temp != null) {
								blck = temp;
							}
						}

						if (query !== void 0) {
							query += blck;

							// }
							if (query.charCodeAt(query.length - 2) === 125) {
								output += query;
								query = void 0;
							}
						}
						else {
							// append blck buffer
							output += blck;
						}
					}

					// reset blck buffer
					blck = '';
				}

				// reset line buffer
				buff = '';			
			}
			// build line by line
			else {
				// \r, \n, new lines
				if (code === 13 || code === 10) {
					if (comline === 1) {
						comment = comline = 0;
						buff = buff.substring(0, buff.indexOf('//'));
					}
					// /
					else if (use && comment === 0 && (length = (str = str.trim()).length) !== 0 && str.charCodeAt(0) !== 47) {
						if (buff.length !== 0) {							
							temp = middleware(7, str, line, column, prefix, output.length);

							if (temp != null) {
								buff = buff.replace(new RegExp(str+'$'), temp);
							}
						}

						str = '';
					}

					column = 0;
					line++;
				}
				else {
					// not `\t` tab character
					if (code !== 9) {
						character = styles.charAt(caret);

						// build line buffer
						if (use && comment === 0) {
							str += character;
						}

						// build character buffer
						buff += character;

						switch (code) {
							// " character
							case 34: {
								if (comment === 0) {
									// exit string " context / enter string context
									strings = strings === 34 ? 0 : (strings === 39 ? 39 : 34);
								}
								break;
							}
							// ' character
							case 39: {
								if (comment === 0) {
									// exit string ' context / enter string context
									strings = strings === 39 ? 0 : (strings === 34 ? 34 : 39);
								}
								break;
							}
							// ( character
							case 40: {
								if (strings === 0 && comment === 0) {
									func = 1;
								}
								break;
							}
							// ) character
							case 41: {
								if (strings === 0 && comment === 0) {
									func = 0;
								}
								break;
							}
							// / character
							case 47: {
								if (strings === 0 && func === 0) {
									char = styles.charCodeAt(caret - 1);

									// /, begin line comment
									if (comblck === 0 && char === 47) {
										comment = comline = 1;
									}
									// *, end block comment
									else if (char === 42) {
										comment = comblck = 0;
										buff = buff.substring(0, buff.indexOf('/*'));
									}
								}

								break;
							}
							// * character
							case 42: {
								if (strings === 0 && func === 0 && comline === 0 && comblck === 0) {
									// /, begin block comment
									if (styles.charCodeAt(caret - 1) === 47) {
										comment = comblck = 1;
									}
								}

								break;
							}
						}
					}

					// move column position
					column++;
				}
			}

			// move caret position
			caret++;
		}

		// trailing flat css
		if (flat !== void 0 && flat.length !== 0) {
			flat = prefix + ' {' + flat + '}';

			// middleware, flat context
			if (use) {
				temp = middleware(4, flat, line, column, prefix, output.length);
			
				if (temp != null) {
					flat = temp;
				}
			}

			// append flat css
			output += flat;
		}

		// has variables
		if (compact && vars !== void 0) {
			// replace all variables
			for (var i = 0; i < varlen; i++) {
				output = output.replace(new RegExp('var\\(' + vars[i][0]+'\\)', 'g'), vars[i][1]);
			}
		}

		// middleware, output context
		if (use) {
			temp = middleware(6, output, line, column, prefix, output.length);
		
			if (temp != null) {
				output = temp;
			}
		}

		return output;
	}


	/**
	 * use plugin
	 * 
	 * @param  {string|function|function[]} key
	 * @param  {function?} plugin
	 * @return {Object} {use, plugins}
	 */
	stylis.use = function (key, plugin) {
		var plugins = stylis.plugins;
		var length = plugins.length;

		if (plugin == null) {
			plugin = key;
			key = void 0;
		}

		if (plugin != null) {
			// object of plugins
			if (plugin.constructor === Object) {
				for (var name in plugin) {
					stylis.use(name, plugin[name]);
				}
			}
			// array of plugins
			else if (plugin.constructor === Array) {
				for (var i = 0, len = plugin.length; i < len; i++) {
					plugins[length++] = plugin[i];
				}
			}
			// single un-keyed plugin
			else if (key == null) {
				plugins[length] = plugin;
			}
			// keyed plugin
			else {
				var pattern = (key instanceof RegExp) ? key : new RegExp(key + '\\([ \\t\\r\\n]*([^\\0]*?)[ \\t\\r\\n]*\\)', 'g');
				var trimmer = /[ \t\r\n]*,[ \t\r\n]*/g;

				var replacer = function (match, group) {
					var params = group.replace(trimmer, ',').split(',');
					var replace = plugin.apply(null, params);

					return replace != null ? replace : match;
				}

				plugins[length] = function (ctx, str) {
					if (ctx === 6) {
						return str.replace(pattern, replacer);
					}
				}
			}
		}

		return stylis;
	};


	/**
	 * plugin store
	 * 
	 * @type {function[]}
	 */
	stylis.plugins = [];


	/**
	 * regular expresions
	 * 
	 * @type {Object<string, RegExp>}
	 */
	stylis.regex = {
		and: /&/g,
		split: /,[\s]*(?![^\r\n\[]*[\]\)])/g,
		import: /@import.*?(["'`][^\.\n\r]*?["'`];|["'`][^:\r\n]*?\.[^c].*?["'`])/g,
		global: [
			/:global\((.*)\)/g, 
			/(?:&| | .*):global\((.*)\)/g
		]
	};


	return stylis;
}));