(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisCustomProperties'] = factory())
}(function () {

	'use strict'

	var store = null

	function replace (match, group) {
		return store[group] || match
	}

	return function (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case -1: {
				// create store
				store = {}
				break
			}
			case -2: {
				// destroy store
				store = null
				break
			}
			case 1: {
				if (content.charCodeAt(0) + content.charCodeAt(1) === 90) {
					// collect custom properties
					var index = content.indexOf(':')
					var name = content.substring(0, index)
					var value = content.substring(index + 1).trim()
					store[name] = value
					return content
				} else if (content.indexOf('var(') > 0) {
					// replace custom properties
					return content.replace(/var\((.*)\)/g, replace) + ';' + content
				}
				break
			}
		}
	}
}))
