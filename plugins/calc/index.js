(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisCalc'] = factory())
}(function () {

	'use strict'

	var units = '(mm|vmax|vmin|vw|vh|pc|pt|in|ex|em|%|rem|px)';
	var digits = '(\\d)'
	var whitespace = '\\s*'
	var capture = '([\\/+\\-*])'
	var pattern = new RegExp(digits+units+'?'+whitespace+capture+whitespace+digits+units+'?','g')

	function reduce (match, group) {
		var out = group.trim()
		var next

		while ((next = out.replace(pattern, evaluate)) !== out) {
			out = next
		}

		return /[-/*+ ]/.test(out) ? 'calc('+out+')' : out
	}

	function evaluate (match, numA, unitA, type, numB, unitB) {
		var unitLeft = (!!unitA)|0
		var unitRight = (!!unitB)|0
		var numLeft = numA|0
		var numRight = numB|0

		switch (unitLeft + unitRight) {
			// no values have unites
			case 0: {
				return operate(numLeft, numRight, type)
			}
			// both values have units
			case 2: {
				if (unitA !== unitB) {
					break					
				}
			}
			// only one value has a unit
			case 1: {
				return operate(numLeft, numRight, type) + (unitA || unitB)
			}
		}

		return match
	}

	function operate (left, right, type) {
		switch (type) {
			case '-': return left - right
			case '+': return left + right
			case '/': return left / right
			case '*': return left * right
		}

		return 0
	} 

	return function (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case 1: {
				return content.indexOf('calc(') > -1 ? content.replace(/calc\(([\s\S]*)\)/g, reduce) : content
			}
		}
	}
}))
