(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisByte'] = factory())
}(function () {

	'use strict'

	var maps = {}
	var heap = []
	var byte = []
	var index = 0
	var stack = []

	var RULE_START = 0
	var RULE_END = 1
	var SELECTOR = 3
	var PROPERTY = 10
	var VALUE = 11

	return function (context, content, selectors, parents, line, column, length) {
		var colon, name, value, cache, block

		switch (context) {
			case 1: {
				name = content.substring(0, colon = content.indexOf(':')).trim()
				value = content.substring(colon+1).trim()

				if ((cache = maps[name]) === void 0) {
					stack.push(PROPERTY, index)
					heap[maps[name] = index++] = name
				} else {
					stack.push(PROPERTY, cache)
				}

				if ((cache = maps[value]) === void 0) {
					stack.push(VALUE, index)
					heap[maps[value] = index++] = value
				} else {
					stack.push(VALUE, cache)
				}

				break
			}
			case 2: {
				value = selectors.join(',')

				if ((cache = maps[value]) === void 0) {
					block = [RULE_START, index].concat(stack).concat([RULE_END])
					heap[maps[value] = index++] = value
				} else {
					block = [RULE_START, cache].concat(stack).concat([RULE_END])
				}

				byte.push.apply(byte, block)
				stack = []
				
				break
			}
			case -2: {	
				return {
					heap: heap,
					byte: byte
				}
			}
		}
	}
}))
