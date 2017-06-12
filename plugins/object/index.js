(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisObject'] = factory())
}(function () {

	'use strict'

	var object = {}

	function toUpperCase (group) {
		return group[1].toUpperCase()
	}

	function toCamel (content) {
		return content.replace(/-([a-z])/g, toUpperCase)
	}

	return function (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case 1: {
				var selector = selectors.join(',')
				var block = object[selector] = object[selector] || {};
				var index = content.indexOf(':')

				block[toCamel(content.substring(0, index))] = content.substring(index+1).trim()
				break
			}
			case -1: {
				object = {}
				break
			}
			case -2: {
				return object
			}
		}
	}
}))
