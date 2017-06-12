(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisMixin'] = factory())
}(function () {
	
	'use strict'

	var store = null

	return function (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case -1: {
				store = {}
				break
			}
			case -2: {
				store = null
				break
			}
			case 1: {
				// mixins
				if (content.charCodeAt(0) === 64) {
					var mixin = store[content.substring(8).trim()]
					return mixin !== void 0 ? mixin.substring(0, mixin.length-1) : ''
				}
				break
			}
			case 3: {
				// collect mixins
				var select = selectors[0]

				if (select.charCodeAt(2) === 105) {
					store[select.substring(6).trim()] = content.substring(content.indexOf('{')+1, content.length-1)
					return ''
				}			
			}
		}
	}
}))
