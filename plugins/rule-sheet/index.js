(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisRuleSheet'] = factory())
}(function () {

	'use strict'

	return function (callback) {
		var stack = []
		var children = []
		var delimiter = '\b'
		var needle = delimiter+'}'

		function toString (block) {
			if (block)
				callback(block + '}')
		}

		return function (context, content, selectors, parents, line, column, length, at, depth) {
			switch (context) {
				// property context
				case 1:
					// @import
					if (depth === 0 && content.charCodeAt(0) === 64)
						return callback(content), ''
					break
				// selector context
				case 2:
					if (at === 0)
						return content + delimiter
					break
				case 3:
					switch (at) {
						// @font-face
						// @page
						// @viewport
						// @counter-style
						case 102:
						case 112:
						case 118:
						case 99:
							return callback(selectors[0]+content), ''
						// @document
						case 100:
							return callback(selectors[0]+'{'+content+'}'), ''
						default:
							return content + delimiter
					}
				case -2:
					content.split(needle).forEach(toString)
			}
		}
	}
}))
