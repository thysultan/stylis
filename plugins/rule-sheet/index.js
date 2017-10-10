(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisRuleSheet'] = factory())
}(function () {

	'use strict'

	return function (callback) {
		var stack = []
		var children = []

		function toString (selectors, content) {
			return selectors.join(',')+'{'+content+'}'
		}

		return function (context, content, selectors, parents, line, column, length, at, depth) {
			switch (context) {
				// property context
				case 1:
					return
				// selector context
				case 2:
					// @at-rule content?
					if (at > 0)
						return

					switch (depth) {
						// normal {}
						case 1:
							stack.push(toString(selectors, content))

							if (children.length > 0)
								children = (stack.push.apply(stack, children), [])
							break
						// flat/nested
						default:
							children.push(toString(selectors, content))
					}

					return ''
				// @at-rule context
				case 3:
					switch (at) {
						// @font-face
						case 102:
						// @page
						case 112:
							stack.push(selectors[0]+content)
						// @viewport
						// @counter-style
						// @document
						case 118:
						case 99:
						case 100:
							break
						default:
							stack.push(toString(selectors, content))
					}

					return ''
				// post process context
				case -2:
					children.forEach(callback)
					stack.forEach(callback)
					children = []
					stack = []
			}
		}
	}
}))
