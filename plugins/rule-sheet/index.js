(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisRuleSheet'] = factory())
}(function () {

	'use strict'

	return function (callback) {
		var stack = []

		function toString (selectors, content) {
			return selectors.join(',')+'{'+content+'}'
		}

		return function (context, content, selectors, parents, line, column, length, at, depth) {
			switch (context) {
				case 1:
					return
				case 2:
					// @at-rule context
					if (at > 0)
						return

					// #a { #b {}} ?
					if (depth > 1)
						return stack.push(toString(selectors, content)), ''

					callback(toString(selectors, content))

					if (stack.length > 0) {
						stack.forEach(callback)
						stack = []
					}

					return ''
				case 3:
					switch (at) {
						// @font-face
						case 102:
						// @page
						case 112:
							return callback(selectors[0]+content), ''
						// @viewport
						// @counter-style
						// @document
						case 118:
						case 99:
						case 100:
							return
						default:
							return callback(toString(selectors, content)), ''
					}
				case -2:
					stack = []
			}
		}
	}
}))
