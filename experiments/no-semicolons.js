/*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * stylis is a feature-rich css preprocessor @licence MIT
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


	function stylis (selector, input) {
		var prefix;

		var eof = input.length;
		var caret = 0;
		var stage = 0;
		var output = '';

		var lineNumber = 0;
		var columnNumber = 0;

		var charCode;
		var currentChar;
		var prevChar;
		var nextChar;
		var cacheChar;

		var charBuffer = ''
		var cacheBuffer = '';
		var parseBuffer = '';
		var tempBuffer = '';
		var blockBuffer = '';
		var flatBuffer = '';

		var blockBuffer1 = '';
		var blockBuffer2 = '';
		var blockBuffer3 = '';

		var isSafe = true;
		var inSelector = false;
		var inString = 0;
		var inComment = 0;
		var inCommentBlock = 0;
		var inCommentLine = 0;
		var inParen = 0;
		var afterColon = 0;
		var delta = -1;
		var length = 0;
		var semicolon = 0;

		outer: while (true) {
			if (delta === 1) {
				inSelector = (cacheChar === 123 || cacheBuffer.charCodeAt(0) === 123) ? true : false;

				console.log(cacheChar, inSelector, parseBuffer, cacheBuffer);

				delta = 0;
			}

			// build buffer
			if (caret < eof) {
				charCode = input.charCodeAt(caret);
				isSafe = inString === 0 && inComment === 0 && inParen === 0;

				if (isSafe &&
					(
						(charCode === 123 || charCode === 125 || charCode === 59) ||
						(afterColon === 1 && prevChar !== 44 && (charCode === 13 || charCode === 10))
					)
				) {
					charBuffer += input.charAt(caret);
					cacheChar = delta === 0 ? charCode : cacheChar;
					parseBuffer = cacheBuffer;
					cacheBuffer = charBuffer.trim();
					charBuffer = '';
					afterColon = 0;

					delta++;
				} else if (charCode === 13 || charCode === 10) {
					// new line
					if (inCommentLine === 1) {
						inComment = inCommentLine = 0;
						charBuffer = charBuffer.substring(0, charBuffer.indexOf('//')).trim();
					}

					columnNumber = 0;
					lineNumber++;
				} else {
					columnNumber++;

					// non-tab character
					if (charCode !== 9) {
						currentChar = input.charAt(caret);

						// non space character
						if (charCode !== 32) {
							prevChar = charCode;
						}

						charBuffer += currentChar;

						switch (charCode) {
							// : character
							case 58: {
								if (inString === 0 && inComment === 0 && inParen === 0) {
									afterColon = 1;
								}
								break;
							}
							// " ' characters
							case 34:
							case 39: {
								if (inComment === 0) {
									if (charCode === 34) {
										inString = inString === 34 ? 0 : inString === 39 ? 39 : 34;
									} else {
										inString = inString === 39 ? 0 : inString === 34 ? 34 : 39;
									}
								}
								break;
							}
							// ( ) characters
							case 40:
							case 41: {
								if (inString === 0 && inComment === 0) {
									inParen = charCode === 40 ? 1 : 0;
								}
								break;
							}
							// / character
							case 47: {
								if (inString === 0 && inParen === 0) {
									charCode = input.charCode(caret-1);

									if (inCommentBlock === 0 && charCode === 47) {
										// / begin line comment
										inComment = inCommentLine = 1;
									} else if (charCode === 42) {
										// *, end block comment
										inComment = inCommentBlock = 0;
										charBuffer = charBuffer.substring(0, charBuffer.indexOf('/*')).trim();
									}
								}
								break;
							}
							// * character
							case 42: {
								if (
									inString === 0 &&
									inParen === 0 &&
									inCommentLine === 0 &&
									inCommentBlock === 0 &&
									input.charCodeAt(caret-1) === 47
								) {
									// / begin block comment
									inComment = inCommentBlock = 1;
								}
								break;
							}
						}
					}
				}

				length++;
				caret++;

				continue;
			}

			break;
		}
	}

	return stylis;
}));
